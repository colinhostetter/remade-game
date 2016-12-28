import React from "react";

export default class FillableBar extends React.Component {
  render() {
    const fillStyle = {
      width: this.props.width * 100 + "%",
      backgroundColor: this.props.fillColor,
      color: this.props.textColor
    };
    return (
      <div className={"fillable-bar-outer " + (this.props.className || "")}>
        <div className="fillable-bar-fill health-bar-fill" style={fillStyle}></div>
        <div className="fillable-bar-text">{this.props.text}</div>
      </div>
    )
  }
}

FillableBar.defaultProps = {
  textColor: "black",
  fillColor: "green"
}