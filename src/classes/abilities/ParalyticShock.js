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
  cast(target, hands) {
    const caster = this.owner;
    caster.emit("line", `You flick ${utils.handstr(hands)} at ${target.shortDesc}, and ${utils.pronoun(target, "subject")} stiffens like a board as a bolt of electricity runs through ${utils.pronoun(target, "possessive")} body.`)
    target.emit("line", {type: "damage-light", text: `${caster.shortDesc} flicks ${utils.handstr(hands, caster)} at you, and your muscles suddenly seize up as an electric shock runs through your body.`});
    target.afflict("paralysis", caster);
    target.damage({
      attacker: caster,
      amount: 3
    });
    return true;
  }
}