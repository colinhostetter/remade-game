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

    const name = props.affliction.name;
    for (var i = 0; i < name.length; i++) {
      const letter = name[i];
      if (letter === this.affDisplay.hotkey) {
        this.displayName = name.slice(0, i) + "[" + letter + "]" + name.slice(i+1, name.length);
        break;
      }
    }
    if (!this.displayName) {
      this.displayName = `${name} [${this.affDisplay.hotkey}]`;
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