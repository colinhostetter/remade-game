"use strict";

const EventEmitter = require("events");
const uuid = require("uuid");

class PhysicalThing extends EventEmitter {
  constructor(initialLoc) {
    super();
    if (!initialLoc || !initialLoc.contents) throw new Error("PhysicalThing created without initial location!");
    this.setLocation(initialLoc);
    this.id = uuid();
  }

  setLocation(newLoc) {
    if (!newLoc) throw new Error("setLocation called without new location!");
    const oldLoc = this.location;
    if (oldLoc) {
      oldLoc.contents.splice(oldLoc.contents.indexOf(this), 1);
      oldLoc.contents.forEach(i => i.emit("locationContentsUpdated"));
    }
    this.location = newLoc;
    newLoc.contents.push(this);
    newLoc.contents.forEach(i => i.emit("locationContentsUpdated"));
  }
}

module.exports = PhysicalThing;