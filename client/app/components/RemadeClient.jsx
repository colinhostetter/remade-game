import React from "react";
import RemadeConsole from "./RemadeConsole.jsx";
import CharacterStatePanel from "./CharacterStatePanel/CharacterStatePanel.jsx";
import AbilityPanel from "./AbilityPanel.jsx";
import LocationContentsPanel from "./LocationContentsPanel.jsx";

class RemadeClient extends React.Component {
  constructor(props) {
    super(props);
    const lines = ["Welcome to Remade!"];
    this.state = {
      lines,
      character: {},
      handCooldown: {},
      afflictionTimers: []
    };
    const socket = props.socket;
    socket.on("line", line => {
      if (line) {
        lines.push(line);
        this.setState({ lines });
      }
    });
    socket.on("characterState", character => {
      const afflictionTimers = this.state.afflictionTimers.filter(i => character.modifiers.includes(i.name));
      this.setState({ character, afflictionTimers });
    })
    socket.on("abilities", abilities => this.setState({ abilities }));
    socket.on("locationContents", locationContents => this.setState({ locationContents }));
    socket.on("targetChanged", target => this.setState({target}));
    socket.on("modifierAdded", mod => {
      console.log(mod)
      const afflictionTimers = [...this.state.afflictionTimers];
      const index = afflictionTimers.findIndex(i => i.name === mod.name)
      if (index > -1) {
        afflictionTimers.splice(index, 1, mod);
      } else {
        afflictionTimers.push(mod);
      }
      this.setState({ afflictionTimers })
    })
  }

  render() {
    return (
      <div className="remade-client">
        <div className="remade-client-left">
          <AbilityPanel abilities={this.state.abilities}></AbilityPanel>
          <RemadeConsole lines={this.state.lines}></RemadeConsole>
        </div>
        <div className="remade-client-right">
          <CharacterStatePanel
            character={this.state.character}
            handCooldown={this.state.handCooldown}
            afflictionTimers={this.state.afflictionTimers} />
          <LocationContentsPanel contents={this.state.locationContents} target={this.state.target}></LocationContentsPanel>
        </div>
      </div>
    )
  }
}

export default RemadeClient;