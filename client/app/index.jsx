import React from "react";
import {render} from "react-dom";
import RemadeClient from "./components/RemadeClient.jsx";
import "../css/index.scss";
import hotkeys from "./hotkeys";

const socket = io();

hotkeys(socket);

render(<RemadeClient socket={socket} />, document.getElementById('app'));