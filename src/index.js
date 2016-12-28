"use strict";

const express = require("express");
const app = express();

app.use("/static", express.static("static"));
app.get("/", (req, res) => {
  res.sendFile("index.html", {root: "./static"});
})

const http = require("http").Server(app);
const io = require("socket.io")(http);

const Player = require("./classes/Player");
const World = require("./classes/World");

io.on("connection", socket => {
  const w = new World();
  const p = new Player(socket, w);
});

http.listen(3000);
