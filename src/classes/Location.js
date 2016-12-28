"use strict";

const {directions} = require("../utils")

class Location {
  constructor(name) {
    this.name = name;
    this.contents = [];
    this.exits = {};
  }

  connect(dir, loc) {
    if (!directions[dir]) throw new Error(`${dir} is not a valid direction`);
    if (!loc instanceof Location) throw new Error("must connect to a Location");
    this.exits[dir] = loc;
    loc.exits[directions[dir].opposite] = this;
  }

  getPrintableExits() {
    return Object.keys(this.exits).map(i => directions[i].fullname);
  }

  serializeContents() {
    return this.contents.map(i => {
      if (i.serialize) {
        return i.serialize();
      } else {
        return {
          shortDesc: i.shortDesc,
          id: i.id
        }
      }
    })
  }
}

module.exports = Location;