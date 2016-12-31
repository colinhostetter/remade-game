"use strict";

const utils = require("../utils");
const Creature = require("./Creature");
const globalActions = require("../actions/globalActions");
const globalAliases = require("../actions/globalAliases");

class Player {
  constructor(socket, world) {
    const sendLine = (line) => {
      socket.emit("line", line);
    }
    const sendState = () => {
      socket.emit("characterState", this.character.serialize())
    }
    const sendAbilities = () => {
      socket.emit("abilities", this.character.abilities.map(i => i.serialize()));
    }
    const sendLocationContents = () => {
      const contents = this.character.location.serializeContents().filter(i => i.id !== this.character.id);
      socket.emit("locationContents", contents);
    };

    this.alive = true;
    this.world = world;
    this.character = new Creature(world.startingLocation, {
      maxHealth: 100,
      currentHealth: 100,
      name: "Colin",
      shortDesc: "the wizard Colin",
      wizard: true
    });
    [this.character.leftHand, this.character.rightHand].forEach(hand => {
      hand.on("free", () => {
        sendLine(`Your ${hand.name} hand is free.`)
        sendState();
      });
      hand.on("cooldown", () => sendState());
    });
    const statusEvents = ["damage", "movement", "modifierAdded", "modifierRemoved", "purifyUsed", "purifyReady"]
    statusEvents.forEach(event => this.character.on(event, sendState));
    this.character.on("locationContentsUpdated", sendLocationContents);
    this.character.on("afflicted", aff => socket.emit("afflicted", aff));
    this.character.on("death", () => socket.emit("death"));

    const Fireball = require("./abilities/Fireball");
    this.character.abilities.push(new Fireball(this.character));
    const ParalyticShock = require("./abilities/ParalyticShock");
    this.character.abilities.push(new ParalyticShock(this.character));

    sendState();
    sendAbilities();
    sendLocationContents();
    
    this.character.on("line", sendLine);

    socket.on("move", ({dir}) => {
      const result = globalActions.move(this, dir);
      socket.emit("line", result);
    })
    socket.on("cast", ({index, hand}) => {
      if (this.character.abilities[index]) {
        const result = this.character.abilities[index].activate(this.target, hand);
        sendLine(result);
      }
    })
    socket.on("target", ({id}) => {
      const target = this.character.location.contents.find(i => i.id === id);
      if (target) {
        const result = globalActions.target(this, target);
        sendLine(result);
        socket.emit("targetChanged", {id});
      }
    })
    socket.on("purify", ({name}) => {
      sendLine(this.character.purify(name));
    })
    socket.on("counterspell", () => this.character.counterspell());
  }

  act(command) {
    const [action, ...args] = command.split(" ").map(i => i.trim()).filter(i => i !== "");
    const char = this.character;

    // try abilities
    for (let ab of char.abilities) {
      if (ab.name === action) {
        return ab.activate(this.target, ...args);
      }
    }

    // try global actions
    if (globalActions[action]) {
      return globalActions[action](this, ...args);
    }

    // try global aliases
    if (globalAliases[action]) {
      const aliasFor = globalAliases[action];
      if (typeof aliasFor === "function") {
        return this.act(aliasFor(...args));
      } else {
        return this.act([aliasFor, ...args].join(" "));
      }
    }

    // Default
    return "I didn't understand that command.";
  }
}

module.exports = Player;