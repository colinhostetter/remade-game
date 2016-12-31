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
  cast(target, hands) {
    const caster = this.owner;
    caster.emit("line", `You gesture grandly with ${utils.handstr(hands)} and a roaring ball of fire flies forth, burning ${target.shortDesc} horribly.`);
    target.emit("line", {type: "damage-heavy", text: `${utils.capitalize(caster.shortDesc)} gestures grandly at you with ${utils.handstr(hands, caster)} and a roaring ball of fire flies forth, burning you horribly.`})
    target.damage({
      attacker: caster,
      amount: hands.length * 20
    })
    target.afflict("ablaze", caster);
    return true;
  }
}

module.exports = Fireball;