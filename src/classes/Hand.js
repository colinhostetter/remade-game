"use strict";

const EventEmitter = require("events");

const STATUS_FREE = "free", STATUS_BUSY = "busy", STATUS_COOLDOWN = "cooldown";

class Hand extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.status = STATUS_FREE;
  }
  isFree() {
    return this.status === STATUS_FREE;
  }
  use(cooldown) {
    this.status = STATUS_COOLDOWN;
    this.emit("cooldown", {hand: this, time: cooldown});
    setTimeout(() => {
      this.status = STATUS_FREE;
      this.emit("free", {hand: this});  
    }, cooldown);
  }
}

module.exports = Hand;