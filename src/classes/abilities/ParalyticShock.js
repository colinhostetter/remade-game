"use strict";

const Ability = require("../Ability");
const utils = require("../../utils");

module.exports = class ParalyticShock extends Ability {
  constructor(...args) {
    super(...args);
    this.cooldown = 5000;
    this.range = 0;
    this.targeted = true;
    this.name = "Paralytic Shock";
    this.icon = "shock.png";
  }
  cast(caster, target, hands, countered) {
    if (countered) {
      target.emit("line", `You flick ${utils.handstr(hands)} at ${caster.shortDesc}, but ${utils.pronoun(target, "possessive")} counterspell is ready! ${utils.capitalize(utils.pronoun(caster, "subject"))} flings the electric bolt back at you, and your muscles seize up!`);
      caster.emit("line", `${utils.capitalize(target.shortDesc)} flicks ${utils.handstr(hands, target)} at you, but your counterspell is ready! You throw the electric bolt back at ${utils.pronoun(caster, "object")}, and ${utils.pronoun(caster, "possessive")} muscles size up!`);
    } else {
      caster.emit("line", `You flick ${utils.handstr(hands)} at ${target.shortDesc}, and ${utils.pronoun(target, "subject")} stiffens like a board as a bolt of electricity runs through ${utils.pronoun(target, "possessive")} body.`)
      target.emit("line", {type: "damage-light", text: `${caster.shortDesc} flicks ${utils.handstr(hands, caster)} at you, and your muscles suddenly seize up as an electric shock runs through your body.`});
    }
    target.addModifier("paralysis", caster);
    target.damage({
      attacker: caster,
      amount: 3
    });
    return true;
  }
}