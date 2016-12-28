"use strict";

function wordList(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("wordList must be passed an array");
  } else if (!arr.length) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]} and ${arr[1]}`;
  } else {
    return `${arr.slice(0, arr.length - 1).join(", ")}, and ${arr[arr.length - 1]}`;
  }
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1, str.length);
}

function handstr(hands, thirdPerson) {
  let str = "";
  if (hands.length > 1) {
    str = "both hands";
  } else {
    str = `${hands[0].name} hand`;
    if (thirdPerson) {
      str = pronoun(thirdPerson, "possessive") + " " + str;
    } else {
      str = "your " + str;
    }
  }
  return str;
}

function pronoun(creature, type) {
  const pronouns = {
    male: {
      possessive: "his",
      subject: "he",
      object: "him",
      reflexive: "himself"
    },
    female: {
      possessive: "hers",
      subject: "she",
      object: "her",
      reflexive: "herself"
    },
    none: {
      possessive: "its",
      subject: "it",
      object: "it",
      reflexive: "itself"
    }
  }
  const gender = creature.gender || "none";
  return pronouns[gender][type];
}

const directions = {
  n: {
    fullname: "north",
    opposite: "s"
  },
  ne: {
    fullname: "northeast",
    opposite: "sw"
  },
  e: {
    fullname: "east",
    opposite: "w"
  },
  se: {
    fullname: "southeast",
    opposite: "nw"
  },
  s: {
    fullname: "south",
    opposite: "n"
  },
  sw: {
    fullname: "southwest",
    opposite: "ne"
  },
  w: {
    fullname: "west",
    opposite: "e"
  },
  nw: {
    fullname: "northwest",
    opposite: "se"
  },
  u: {
    fullname: "up",
    opposite: "d"
  },
  d: {
    fullname: "down",
    opposite: "u"
  }
}

module.exports = {
  wordList,
  capitalize,
  handstr,
  pronoun,
  directions
}