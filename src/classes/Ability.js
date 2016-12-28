"use strict";

const utils = require("../utils");

class Ability {
  constructor(owner) {
    this.owner = owner;
  }
  /*
   * @param {any} target
   * @param {number} hands
   */
  activate(target, ...args) {
    const caster = this.owner;
    const affs = caster.afflictions.filter(i => i.preventsCasting);
    if (!caster.alive) { 
      return "You are dead and cannot do that.";
    } else if (affs.length) {
      return affs[0].castPreventedLine;
    } else if (this.targeted && !target) {
      return "You must target an enemy.";
    } else if (this.targeted && !this.range && caster.location !== target.location) {
      return `Your target (${target.shortDesc}) isn't here.`;
    } else if (this.targeted && this.range) {
      // TODO
    } else if (this.targeted && !target.alive) {
      return `${utils.capitalize(target.shortDesc)} is already dead!`;
    }
    
    var hands;

    if (args[0] === "both") {
      hands = [caster.leftHand, caster.rightHand];
    } else if (args[0] === "right") {
      hands = [caster.rightHand];
    } else if (args[0] === "left") {
      hands = [caster.leftHand];
    } else {
      hands = caster.leftHand.isFree() ? [caster.leftHand] : [caster.rightHand];
      if (!hands[0].isFree()) {
        return "Neither of your hands is free.";
      }
    }
    const notFree = hands.filter(hand => !hand.isFree());
    if (notFree.length) {
      return `Your ${notFree.length > 1 ? "hands are" : notFree[0].name + " hand is"} not free.`;
    }
    const success = this.cast(target, hands);
    if (success) {
      hands.forEach(hand => hand.use(this.cooldown));
    }
  }
  serialize() {
    return {
      name: this.name,
      icon: this.icon
    }
  }
}

module.exports = Ability;