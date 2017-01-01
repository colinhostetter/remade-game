"use strict";

const utils = require("../utils");
const uuid = require("uuid");
const PhysicalThing = require("./PhysicalThing");
const Hand = require("./Hand");
const modifiers = require("./modifiers");
const constants = require("../constants");

class Creature extends PhysicalThing {
  constructor(startingLoc, props) {
    super(startingLoc);
    this.alive = true;
    this.abilities = [];
    this.modifiers = [];
    this.leftHand = new Hand("left");
    this.rightHand = new Hand("right");
    this.thinkInterval = 1000;
    this.purifyReady = true;
    this.purifyHealAmount = constants.PURIFY_HEAL_AMOUNT;
    this.purifyCooldown = constants.PURIFY_COOLDOWN;
    this.counterspellReady = true;
    this.counterspellCooldown = constants.COUNTERSPELL_COOLDOWN;
    Object.assign(this, props);
    setImmediate(() => {
      this._thinkIntervalId = setInterval(this.think.bind(this), this.thinkInterval);
    });
  }
  moveTo(loc) {
    if (!this.alive) return;
    const affs = this.modifiers.filter(i => i.preventsMovement);
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
      modifiers: this.modifiers.map(i => i.name),
      purifyReady: this.purifyReady
    }
  }
  damage({ attacker, amount }) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
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
    this.modifiers.forEach(aff => this.removeModifier(aff));
    if (killer) killer.emit("line", `You kill ${this.shortDesc}!`);
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
  addModifier(name, source, params = {}) {
    if (!this.alive) return;
    // Create modifier object
    const proto = modifiers[name];
    if (!proto) {
      throw new Error(`Tried to create non-existent modifier ${name}.`);
    }
    const mod = Object.create(proto);
    mod.source = source;
    mod.id = uuid();
    if (mod.hasCharges) mod.charges = 1;
    Object.assign(mod, params);
    mod.target = this;
    
    // Do we already have this modifier?
    const existingAffIndex = this.modifiers.findIndex(i => i.name === mod.name)
    if (existingAffIndex > -1) {
      // Replace the existing one with this one
      const existing = this.modifiers[existingAffIndex];
      if (existing._durationTimeoutId) clearTimeout(existing._durationTimeoutId);
      if (existing._tickIntervalId) clearInterval(existing._tickIntervalId);
      if (mod.onRefresh) {
        mod.onRefresh(existing, mod);
      }
      this.modifiers.splice(existingAffIndex, 1, mod);
    } else {
      this.modifiers.push(mod);
    }
    
    if (mod.duration) {
      mod._durationTimeoutId = setTimeout(() => {
        this.removeModifier(mod);
        this.emit("line", mod.expireLine || mod.cureLine || "");
        if (mod.onExpire) mod.onExpire();
      }, mod.duration);
    }
    if (mod.tick) {
      mod._tickIntervalId = setInterval(() => mod.onTick(), mod.tick);
    }
    this.emit("modifierAdded", {
      name: mod.name, 
      label: mod.label, 
      id: mod.id,
      duration: mod.duration,
      hasCharges: mod.hasCharges,
      charges: mod.charges
    });
  }
  removeModifier(mod) {
    const index = this.modifiers.findIndex(i => i === mod);
    if (mod._durationTimeoutId) clearTimeout(mod._durationTimeoutId);
    if (mod._tickIntervalId) clearInterval(mod._tickIntervalId);
    this.modifiers.splice(index, 1);
    this.emit("modifierRemoved", mod);
  }
  purify(affName) {
    const aff = this.modifiers.find(i => i.name === affName);
    if (!this.purifyReady) {
      return "You can't purify yourself again so soon.";
    } else if (aff || affName === "health") {
      if (aff) {
        this.removeModifier(aff);
        this.emit("line", `You are briefly enveloped in a brilliant white light as you purify an affliction. ${aff.cureLine || ""}`)
        this.project(this.shortDesc + ` is briefly enveloped in a brilliant white light as ${utils.pronoun(this, "subject")} purifies an affliction. ${aff.cureLineThirdParty ? aff.cureLineThirdParty() : ""}`);
        if (aff.onPurify) aff.onPurify();
      } else if (affName === "health") {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + this.purifyHealAmount);
        this.emit("line", "You are briefly enveloped in a brilliant white light as your wounds close.");
        this.project(this.shortDesc + ` is briefly envloped in a brilliant white light as ${utils.pronoun(this, "possessive")} wounds close.`);
      }
      this.purifyReady = false;
      this.emit("purifyUsed");
      this._purifyTimeoutId = setTimeout(() => {
        this.purifyReady = true;
        this._purifyTimeoutId = null;
        this.emit("purifyReady");
        this.emit("line", "You are able to purify yourself once more.");
      }, this.purifyCooldown);
    }
  }
  hasModifier(name) {
    return Boolean(this.getModifier(name));
  }
  getModifier(name) {
    return this.modifiers.find(i => i.name === name);
  }
  counterspell() {
    if (this.counterspellReady) {
      this.addModifier("counterspell", this);
      this.counterspellReady = false;
      this.emit("counterspellReady");
      this.emit("line", "You mentally prepare a counter to incoming magic.");
    } else if (this.hasModifier("counterspell")) {
      this.emit("line", "Your counterspell is already up.");
    } else {
      this.emit("line", "You can't prepare a counterspell again so soon.");
    }
  }
}

module.exports = Creature;