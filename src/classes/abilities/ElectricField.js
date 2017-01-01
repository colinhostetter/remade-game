const utils = require("../../utils");
const Ability = require("../Ability");

module.exports = class ElectricField extends Ability {
  constructor(...args) {
    super(...args);
    this.cooldown = 3500;
  }
  cast(caster, target, hands, countered) {
    if (hands.length === 1) {
      target.addModifier("electricField", caster);
    } else if (hands.length === 2) {
      const mod = target.getModifier("electricField");
      if (!mod) {
        // no effect
      } else {
        target.removeModifier(mod);
        target.damage({ attacker: caster, amount: mod.charges * mod.charges });
      }
    }
    return true;
  }
}