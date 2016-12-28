import React from "react";
import FillableBar from "../FillableBar.jsx";
import HandBar from "./HandBar.jsx";
import AfflictionBar from "./AfflictionBar.jsx";
import Minimap from "./Minimap.jsx";
import PurifyIndicator from "./PurifyIndicator.jsx";

class CharacterStatePanel extends React.Component {
  render() {
    const char = this.props.character;
    return (
      <div className="character-state-panel">
        <FillableBar text={char.currentHealth + "/" + char.maxHealth} width={char.currentHealth/char.maxHealth} className="health-bar" />
        <div className="hand-indicators">
          <HandBar text="L" free={char.leftHandFree} hand="left" />
          <HandBar text="R" free={char.rightHandFree} hand="right" />
        </div>
        <PurifyIndicator ready={char.purifyReady} />
        {this.props.afflictionTimers.map(aff => <AfflictionBar key={aff.id} affliction={aff}/> )}
        {/*<Minimap location={char.location}></Minimap>*/}
      </div>
    )
  }
}

export default CharacterStatePanel;