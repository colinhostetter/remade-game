"use strict";

import React from "react";

export default class RemadeConsole extends React.Component {
  componentDidUpdate() {
    window.requestAnimationFrame(() => {
      this.refs.console.scrollTop = this.refs.console.scrollHeight;
    })
  }
  render() {
    const renderedLines = this.props.lines.map((line, index) => {
      const classes = "console-line " + (index % 2 === 0 ? "even" : "odd");
      if (typeof line === "string") {
        return <div className={classes} key={index}>{line}</div>;
      } else if (Array.isArray(line)) {
        return (
          <div className={classes} key={index}>
            {line.map((segment,index2) => {
              return <span className={segment.type} key={`${index}-${index2}`}>{segment.text + " "}</span>;
            })}
          </div>
        );
      } else if (typeof line === "object" && line !== null && line.type) {
        return <div className={classes + " " + line.type} key={index}>{line.text}</div>;
      }
    })
    return (
      <div className="remade-console" ref="console">
        {renderedLines}
      </div>
    );
  }
}