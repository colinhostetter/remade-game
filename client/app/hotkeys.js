"use strict";

import afflictions from "./afflictions.js";

export default function(socket) {
  var locationContents = [];
  socket.on("locationContents", data => locationContents = data);
  const cast = function(index) {
    return function(ev) {
      var hand;
      if (ev.ctrlKey && ev.altKey) {
        hand = "both";
      } else if (ev.ctrlKey) {
        hand = "left";
      } else if (ev.altKey) {
        hand = "right";
      }
      socket.emit("cast", {index, hand});
    }
  }
  const move = function(dir) {
    return function() {
      socket.emit("move", {dir});
    }
  }
  const target = function(index) {
    return function() {
      if (locationContents[index]) socket.emit("target", {id: locationContents[index].id});
    }
  }
  const purify = function(name) {
    return function() {
      socket.emit("purify", {name});
    }
  }

  const targets = {};
  for (var i = 0; i < 9; i++) { targets[i+1] = target(i) };

  const affKeys = {};
  for (let name in afflictions) { affKeys[afflictions[name].hotkey] = purify(name) }

  const actions = Object.assign({}, targets, affKeys, {
    ArrowDown: move("s"),
    ArrowUp: move("n"),
    ArrowLeft: move("w"),
    ArrowRight: move("e"),
    q: cast(0),
    w: cast(1),
    e: cast(2),
    r: cast(3),
  });

  document.addEventListener("keydown", event => {
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key](event);
    }
  })
}