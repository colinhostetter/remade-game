"use strict";

const utils = require("../utils");
const Creature = require("../classes/Creature");

module.exports = {
  look(player) {
    let result = [];

    const contents = player.character.location.contents
      .filter(i => i !== player.character)
      .map(i => i.alive ? i.shortDesc : i.shortDescDead);
    if (contents.length) {
      result.push({type: "contents", text: `You see ${utils.wordList(contents)} here.`});
    }

    const exits = player.character.location.getPrintableExits();
    const exitOrder = ["north", "east", "south", "west"];
    exits.sort((a, b) => {
      const indexA = exitOrder.indexOf(a), indexB = exitOrder.indexOf(b);
      if (indexA > indexB) return 1;
      else if (indexA < indexB) return -1;
      else return 0;
    })
    if (exits.length === 0) {
      result.push({type: "exits", text: "There are no exits."});
    } else if (exits.length === 1) {
      result.push({type: "exits", text: `There is an exit to the ${utils.wordList(exits)}.`});
    } else {
      result.push({type: "exits", text: `There are exits to the ${utils.wordList(exits)}.`});
    }

    return result;
  },
  move(player, dir) {
    const loc = player.character.location.exits[dir];
    if (loc) {
      const result = player.character.moveTo(loc);
      if (result === true) return [{text: `You move ${utils.directions[dir].fullname}.`}, ...this.look(player)];
      else return result;
    } else {
      return "You can't go that way.";
    }
  },
  target(player, thing) {    
    const targetstr = thing.shortDesc;
    if (thing === player.target) {
      return `You are already targeting ${targetstr}.`;
    } else {
      player.target = thing;
      return `You change your target to ${targetstr}.`;
    }
  }
}
