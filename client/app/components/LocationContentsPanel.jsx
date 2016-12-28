"use strict";

import React from "react";
import FillableBar from "./FillableBar.jsx";

export default class LocationContentsPanel extends React.Component {
  render() {
    return (
      <div className="location-contents-panel">
        {this.props.contents.map((thing, index) => {
          if (this.props.target && thing.id === this.props.target.id) {
            var indicator = <img src="/static/img/crosshair.png" className="target-crosshair" />;
            var classes = "physical-thing targeted";
          } else {
            var indicator = <div>{`${index+1}.`}</div>;
            var classes = "physical-thing";
          }
          var text = <div className="physical-thing-text-wrapper">{indicator} <div className="short-desc">{thing.shortDesc}</div></div>
          return (
            <FillableBar className={classes} key={thing.id} text={text} width={thing.currentHealth/thing.maxHealth} />
          );
        })}
      </div>
    );
  }
}
LocationContentsPanel.defaultProps = {
  contents: []
}