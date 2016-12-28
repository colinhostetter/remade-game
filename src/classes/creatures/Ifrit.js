"use strict";

const Creature = require("../Creature");
const Fireball = require("../abilities/Fireball");
const basicAggressiveThinker = require("./thinkers/basicAggressive");

class Ifrit extends Creature {
  constructor(...args) {
    super(...args);
    this.maxHealth = 50;
    this.currentHealth = 50;
    this.abilities = [
      new Fireball(this)
    ];
    this.shortDesc = "a wickedly horned ifrit";
    this.shortDescDead = "a cooling ifrit corpse";
    this.exitMessage = "A wickedly horned ifrit stomps out to the %DIR, leaving cinders in its footprints.";
    this.enterMessage = "A wickedly horned ifrit stomps in from the %DIR, glowering at you.";
    this.name = "ifrit";
    this.think = basicAggressiveThinker(this.abilities[0]);
  }
}

module.exports = Ifrit;