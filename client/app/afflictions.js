"use strict";

const afflictions = {
  ablaze: {
    fillColor: "red",
    textColor: "white",
    hotkey: "a"
  },
  paralysis: {
    fillColor: "blue",
    textColor: "white",
    hotkey: "p"
  },
  health: {
    hotkey: "h"
  }
};

export default afflictions;
export const byHotkey = {};

for (let affName in afflictions) {
  byHotkey[afflictions[affName].hotkey] = affName;
}
