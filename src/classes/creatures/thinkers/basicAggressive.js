"use strict";

// Pass a single ability, the range=0 offensive ability to use here.
module.exports = function(ability) {
  let target = null;
  return function() {
    const possibleTargetsInRoom = this.location.contents.filter(i => i.wizard);
    if (possibleTargetsInRoom.length) {
      if (!target || !possibleTargetsInRoom.includes(target)) {
        // Pick a new target
        target = possibleTargetsInRoom[Math.floor(Math.random() * possibleTargetsInRoom.length)];
      }
      ability.activate(target);
    } else if (!possibleTargetsInRoom.length && target) {
      // Chase down the target if they are within 2 rooms
      let targetIsNearby = false, adj = null;
      for (let exit in this.location.exits) {
        adj = this.location.exits[exit];
        if (adj.contents.includes(target)) {
          targetIsNearby = true;
          break;
        } else {
          for (let exit2 in adj.exits) {
            if (adj.exits[exit2].contents.includes(target)) {
              targetIsNearby = true;
              break;
            }
          }
        }
      }
      if (targetIsNearby) {
        this.moveTo(adj);
      } else {
        target = null;
      }
    }
  }
}