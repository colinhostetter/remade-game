"use strict";

const utils = require("../utils")

/*
 * Affliction properties
 * ---------------------
 * name: The internal name for this affliction. Should the the same as its key.
 * duration: The time (ms) after which this affliction should expire if not cured.
 * tick: The interval (ms) at which this affliction should invoke its onTick function.
 * onTick: A callback function that will be invoked on the tick interval specified above. Will be passed the victim of this affliction.
 * cureLine: The line that will be sent to the victim when this affliction is cured.
 * preventsMovement: Should this affliction prevent the victim from moving?
 * preventsCasting: Should this affliction prevent the victim from casting?
 */

module.exports = {
  ablaze: {
    name: "ablaze",
    label: "ablaze",
    duration: 5000,
    tick: 2000,
    onTick: function(victim) {
      victim.emit("line", {type: "damage-light", text: `The searing flames engulfing you burn your flesh horribly!`});
      victim.project(`The searing flames engulfing ${victim.shortDesc} burn ${utils.pronoun(victim, "possessive")} flesh horribly.`);
      victim.damage({attacker: this.source, amount: 3});
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
  }
}