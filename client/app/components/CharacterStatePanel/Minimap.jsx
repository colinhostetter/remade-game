import React from "react";

const northSouthExit = (x, y, classes) => <span className="minimap-icon north-south" key={x + "," + y}>|</span>;
const eastWestExit = (x, y, classes) => <span className="minimap-icon east-west" key={x + "," + y}>-</span>;
const room = (x, y, classes) => <span className={classes + " minimap-icon room"} key={x + "," + y}>X</span>;
const empty = (x, y, classes) => <span className="minimap-icon empty" key={x + "," + y}>&nbsp;</span>;

class Minimap extends React.Component {
  constructor(props) {
    super();
    this.map = Array(10).fill().map(() => []);
  }
  componentWillReceiveProps(props) {
    const {x,y} = props.location;
    if (!this.map[x][y]) {
      this.map[x][y] = props.location;
    }
  }
  render() {
    const rows = Array(10 * 2 + 1).fill().map(() => []);
    if (this.props.location) {
      const locX = this.props.location.x;
      const locY = this.props.location.y;
      let rowIndex = 0;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const loc = this.map[x] && this.map[x][y];
          if (loc) {
            const roomClasses = (locX === x && locY === y) ? "current-location" : undefined;
            rows[y*2].push(room(x*2, y*2, roomClasses));

            if (loc.exits.includes("n") && rows[y*2-1]) rows[y*2-1][x*2] = northSouthExit(x*2, y*2-1);
            if (loc.exits.includes("w")) rows[y*2][x*2-1] = eastWestExit(x*2-1, y*2);

            if (loc.exits.includes("e")) rows[y*2].push(eastWestExit(x*2+1, y*2));
            else rows[y*2].push(empty(x*2+1, y*2));

            if (loc.exits.includes("s")) rows[y*2+1].push(northSouthExit(x*2, y*2+1), empty(x*2+1, y*2+1));
            else rows[y*2+1].push(empty(x*2, y*2+1), empty(x*2+1, y*2+1));
          } else {
            rows[y*2].push(empty(x*2, y*2), empty(x*2+1, y*2));
            rows[y*2+1].push(empty(x*2, y*2+1), empty(x*2+1, y*2+1));
          }
        }
      }
    }
    return (
      <div className="minimap">
        {rows.map((row, index) => {
          return <div className="minimap-row" key={index}>{row}</div>
        })}
      </div>
    )
  }
}

export default Minimap;