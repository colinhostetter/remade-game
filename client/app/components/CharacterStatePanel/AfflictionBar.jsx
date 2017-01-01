"use strict";

import React from "react";
import FillableBar from "../FillableBar.jsx";
import afflictions from "../../afflictions.js";

export default class AfflictionBar extends React.Component {
  constructor(props) {
    super();
    this.state = {
      timeLeft: props.affliction.duration
    }
    this.intervalId = setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.setState({timeLeft: this.state.timeLeft - 30});
      } else {
        clearInterval(this.intervalId);
      }
    }, 30)
    this.affDisplay = afflictions[props.affliction.name];
    if (!this.affDisplay) this.affDisplay = { hotkey: "" }

    const label = props.affliction.label;
    for (var i = 0; i < label.length; i++) {
      const letter = label[i];
      if (letter === this.affDisplay.hotkey) {
        this.displayName = label.slice(0, i) + "[" + letter + "]" + label.slice(i+1, label.length);
        break;
      }
    }
    if (!this.displayName) {
      this.displayName = `[${this.affDisplay.hotkey}] ${label}`;
    }
    if (props.affliction.hasCharges) {
      this.displayName += ` (x${props.affliction.charges})`;
    }
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  render() {
    return <FillableBar
              text={this.displayName}
              width={this.state.timeLeft / this.props.affliction.duration}
              textColor={this.affDisplay.textColor}
              fillColor={this.affDisplay.fillColor} />
  }
}