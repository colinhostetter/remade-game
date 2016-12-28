"use strict";

import React from "react";

const hotkeys = ["Q", "W", "E", "R"];

export default class AbilityPanel extends React.Component {
  render(props) {
    return (
      <div className="ability-panel">
        {this.props.abilities.map((ab, index) => {
          const style = {backgroundImage: `url("/static/img/${ab.icon}")`};
          return (
            <div className="ability-button" style={style} key={index}>
              <div className="hotkey-indicator">{hotkeys[index]}</div>
            </div>
          );
        })}
      </div>
    )
  }
}
AbilityPanel.defaultProps = {
  abilities: [] 
}