"use strict";

const utils = require("../utils");
const uuid = require("uuid");
const PhysicalThing = require("./PhysicalThing");
const Hand = require("./Hand");
const afflictions = require("./afflictions");

class Creature extends PhysicalThing {
  constructor(startingLoc, props) {
    super(startingLoc);
    this.alive = true;
    this.abilities = [];
    this.afflictions = [];
    this.leftHand = new Hand("left");
    this.rightHand = new Hand("right");
    this.thinkInterval = 1000;
    this.purifyReady = true;
    this.cureCooldown = 5000;
    Object.assign(this, props);
    setImmediate(() => {
      this._thinkIntervalId = setInterval(this.think.bind(this), this.thinkInterval);
    });
  }
  moveTo(loc) {
    if (!this.alive) return;
    const affs = this.afflictions.filter(i => i.preventsMovement);
    if (affs.length) {
      return affs[0].movementPreventedLine;
    }

    const oldLoc = this.location;
    this.setLocation(loc);
    const exitDir = Object.keys(oldLoc.exits).find(i => oldLoc.exits[i] === loc);
    const enterDir = Object.keys(loc.exits).find(i => loc.exits[i] === oldLoc);
    const exit = (this.exitMessage || `${utils.capitalize(this.shortDesc)} exits to the %DIR.`).replace(/\%DIR/g, utils.directions[exitDir].fullname);
    const enter = (this.enterMessage || `${utils.capitalize(this.shortDesc)} enters from the %DIR.`).replace(/\%DIR/g, utils.directions[enterDir].fullname);
    oldLoc.contents.forEach(i => i.emit && i.emit("line", exit));
    loc.contents.filter(i => i !== this).forEach(i => i.emit && i.emit("line", enter));
    this.emit("movement", loc);
    return true;
  }
  serialize() {
    return {
      alive: this.alive,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth,
      leftHandFree: this.leftHand.isFree(),
      rightHandFree: this.rightHand.isFree(),
      location: {
        x: this.location.x,
        y: this.location.y,
        exits: Object.keys(this.location.exits)
      },
      shortDesc: this.shortDesc,
      id: this.id,
      afflictions: this.afflictions.map(i => i.name),
      purifyReady: this.purifyReady
    }
  }
  takeDamage({ attacker, amount }) {
    this.currentHealth = this.currentHealth - amount;
    this.emit("damage", { attacker, amount });
    this.location.contents.filter(i => i !== this).forEach(i => i.emit("locationContentsUpdated"));
    if (this.currentHealth <= 0) {
      this.die(attacker);
    }
  }
  die(killer) {
    this.alive = false;
    if (this._thinkIntervalId) clearInterval(this._thinkIntervalId)
    this.currentHealth = 0;
    this.afflictions.forEach(aff => this.cure(aff));
    killer.emit("line", `You kill ${this.shortDesc}!`);
    this.emit("line", {type: "death", text: "You die..."});
    this.emit("death");
  }
  think() {
    // Implemented by children
    // If there is no implementation (e.g. because this creature is player controlled)
    // we should stop bothering to call this function
    clearInterval(this._thinkIntervalId);
  }
  project(line) {
    this.location.contents.filter(i => i !== this).forEach(i => i.emit("line", line));
  }
  afflict(affName, source, params = {}) {
    if (!this.alive) return;
    // Create affliction object
    const proto = afflictions[affName]
    if (!proto) {
      throw new Error(`Tried to create non-existent afflictions ${affName}.`);
    }
    const aff = Object.create(proto);
    aff.source = source;
    aff.id = uuid();
    Object.assign(aff, params);
    aff.victim = this;
    
    // Do we already have this affliction?
    const existingAffIndex = this.afflictions.findIndex(i => i.name === aff.name)
    if (existingAffIndex > -1) {
      // Replace the existing one with this one
      const existing = this.afflictions[existingAffIndex];
      if (existing._durationTimeoutId) clearTimeout(existing._durationTimeoutId);
      if (existing._tickIntervalId) clearInterval(existing._tickIntervalId);
      this.afflictions.splice(existingAffIndex, 1, aff);
    } else {
      this.afflictions.push(aff);
    }
    
    if (aff.duration) {
      aff._durationTimeoutId = setTimeout(() => {
        this.cure(aff);
        this.emit("line", aff.cureLine);
      }, aff.duration);
    }
    if (aff.tick) {
      aff._tickIntervalId = setInterval(() => aff.onTick(aff.victim), aff.tick);
    }
    this.emit("afflicted", {name: aff.name, id: aff.id, duration: aff.duration, textColor: aff.textColor, fillColor: aff.fillColor});
  }
  cure(aff, silent) {
    const index = this.afflictions.findIndex(i => i === aff);
    if (aff._durationTimeoutId) clearTimeout(aff._durationTimeoutId);
    if (aff._tickIntervalId) clearInterval(aff._tickIntervalId);
    this.afflictions.splice(index, 1);
    this.emit("cured", aff);
  }
  purify(affName) {
    const aff = this.afflictions.find(i => i.name === affName);
    if (!this.purifyReady) {
      return "Your pendant isn't ready to purify another affliction yet.";
    } else if (aff) {
      this.cure(aff);
      this.purifyReady = false;
      this.emit("purifyUsed");
      this.emit("line", `Your are briefly enveloped in a brilliant white light as your pendant purifies an affliction. ${aff.cureLine}`)
      this._purifyTimeoutId = setTimeout(() => {
        this.purifyReady = true;
        this._purifyTimeoutId = null;
        this.emit("purifyReady");
        this.emit("line", "Your pendant is ready to purify another affliction.");
      }, 5000);
    }
  }
}

module.exports = Creature;