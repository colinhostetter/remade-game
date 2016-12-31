"use strict";

const Ability = require("../Ability");
const utils = require("../../utils");

class Fireball extends Ability {
  constructor(...args) {
    super(...args);
    this.cooldown = 5000;
    this.range = 0;
    this.targeted = true;
    this.name = "fireball";
    this.icon = "fireball.png";
  }
  cast(caster, target, hands, countered) {
    if (countered) {
      target.emit("line", {type: "damage-heavy", text: `You gesture grandly with ${utils.handstr(hands)} and a roaring ball of fire flies forth, but rebounds off ${caster.shortDesc}'s counterspell! ${utils.capitalize(utils.pronoun(caster, "subject"))} flings the fireball back at you, burning you horribly!`});
      caster.emit("line", `${utils.capitalize(target.shortDesc)} gestures grandly at you with ${utils.handstr(hands, target)} and a roaring ball of fire flies forth, but your counterspell is ready! You fling the fireball back at ${utils.pronoun(target, "object")}, burning ${utils.pronoun(target, "object")} horribly!`);
    } else {
      caster.emit("line", `You gesture grandly with ${utils.handstr(hands)} and a roaring ball of fire flies forth, burning ${target.shortDesc} horribly.`);
      target.emit("line", {type: "damage-heavy", text: `${utils.capitalize(caster.shortDesc)} gestures grandly at you with ${utils.handstr(hands, caster)} and a roaring ball of fire flies forth, burning you horribly.`})
    }
    target.damage({
      attacker: caster,
      amount: hands.length * 20
    })
    target.addModifier("ablaze", caster);
    return true;
  }
}

module.exports = Fireball;