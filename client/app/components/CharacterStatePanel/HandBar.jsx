"use strict";

import React from "react";
import FillableBar from "../FillableBar.jsx";

const TICK_INTERVAL = 0.03;

export default class HandBar extends React.Component {
  render() {
    var classes = "hand-indicator";
    if (this.props.free) classes += " free";
    return (
      <div className={classes}>
        <div className="hand-indicator-text">{this.props.text}</div>
      </div>
    );
  }
}