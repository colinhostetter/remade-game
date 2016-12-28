"use strict";

import React from "react";

export default class PurifyIndicator extends React.Component {
  render() {
    const classes = `purify-indicator ${this.props.ready ? "ready" : "cooldown"}`
    return (
      <div className={classes}>
        <div className="purify-indicator-text">Purify</div>
      </div>
    );
  }
}