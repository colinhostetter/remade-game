"use strict";

const utils = require("../utils")

/*
 * Modifier properties
 * ---------------------
 * name: The internal name for this modifier. Should the the same as its key.
 * duration: The time (ms) after which this modifier should expire if not cured.
 * tick: The interval (ms) at which this modifier should invoke its onTick function.
 * onTick: A callback function that will be invoked on the tick interval specified above. Will be passed the target of this modifier.
 * cureLine: The line that will be sent to the target when this modifier is cured.
 * preventsMovement: Should this modifier prevent the target from moving?
 * preventsCasting: Should this modifier prevent the target from casting?
 */

module.exports = {
  // afflictions (any modifier w/o buff:true is an affliction)
  ablaze: {
    name: "ablaze",
    label: "ablaze",
    duration: 5000,
    tick: 2000,
    onTick: function() {
      this.target.emit("line", {type: "damage-light", text: `The searing flames engulfing you burn your flesh horribly!`});
      this.target.project(`The searing flames engulfing ${this.target.shortDesc} burn ${utils.pronoun(this.target, "possessive")} flesh horribly.`);
      this.target.damage({attacker: this.source, amount: 3});
    },
    cureLine: "The flames on your body go out."
  },
  paralysis: {
    name: "paralysis",
    label: "paralysis",
    duration: 750,
    preventsMovement: true,
    preventsCasting: true,
    movementPreventedLine: "You are paralyzed and cannot do that.",
    castPreventedLine: "You are paralyzed and cannot do that.",
    cureLine: "You are no longer paralyzed."
  },

  // buffs
  counterspell: {
    name: "counterspell",
    label: "counterspell",
    duration: 1000,
    expireLine: "Your counterspell expires.",
    onExpire: function() {
      this.source._counterspellTimeoutId = setTimeout(() => {
        this.source.counterspellReady = true;
        this.source._counterspellTimeoutId = null;
        this.source.emit("counterspellReady");
        this.source.emit("line", "You are ready to prepare a counterspell once again.");
      }, 8000);
    }
  }
}