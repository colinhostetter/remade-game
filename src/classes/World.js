"use strict";

const Location = require("./Location");
const Creature = require("./Creature");

const LOC_CREATION_PROBABILITY = .65;
const EXIT_CREATION_PROBABILITY = .8;
const GRID_SIZE_X = 10;
const GRID_SIZE_Y = 10;
const MIN_LOCS = 50;

class World {
  constructor() {
    while (!this.map) {
      const map = [];
      // Randomly generate rooms
      for (let x = 0; x < GRID_SIZE_X; x++) {
        map.push([]);
        for (let y = 0; y < GRID_SIZE_Y; y++) {
          const loc = Math.random() < LOC_CREATION_PROBABILITY ? new Location() : null;
          if (loc) {
            loc.x = x;
            loc.y = y;
          }
          map[x].push(loc);
        }
      }

      // Randomly connect some of these rooms
      for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map[x].length; y++) {
          var loc = map[x][y];
          if (!loc) continue;

          ["e", "s"].forEach(dir => {
            if (dir === "e") var adjacent = map[x+1] && map[x+1][y];
            else if (dir === "s") var adjacent = map[x][y+1];
            
            if (adjacent && Math.random() < EXIT_CREATION_PROBABILITY) {
              loc.connect(dir, adjacent);
            }
          })
        } 
      }

      // We probably have some rooms that are adjacent but unreachable that we should try to connect 
      connectBlobs(map);

      // See if this map is good
      const playArea = getBlobs(map).sort((a, b) => {
        if (a > b) return -1;
        else if (a < b) return 1;
        else return 0;
      })[0];
      if (playArea.length >= MIN_LOCS) {
        // Make this the world map
        this.map = map;

        // Delete inaccessible rooms from map
        for (let x = 0; x < map.length; x++) {
          for (let y = 0; y < map[x].length; y++) {
            const loc = map[x][y];
            if (loc && !playArea.includes(loc)) {
              map[x][y] = null;
            }
          }
        }

        // Decide on a starting point
        const corners = {
          nw: [0, 0],
          ne: [GRID_SIZE_X - 1, 0],
          se: [GRID_SIZE_X - 1, GRID_SIZE_Y - 1],
          sw: [0, GRID_SIZE_Y]
        };
        const corner = Object.keys(corners)[Math.floor(Math.random() * Object.keys(corners).length)];
        let [x,y] = corners[corner];
        while (!this.startingLocation) {
          if (map[x][y]) {
            this.startingLocation = map[x][y];
          } else {
            switch (corner) {
              case "nw":
                if (x < y) x++;
                else y++;
                break;
              case "ne":
                if (GRID_SIZE_X - x < y) x--;
                else y++;
                break;
              case "se":
                if (GRID_SIZE_X - x < GRID_SIZE_Y - y) x--;
                else y--;
                break;
              case "sw":
                if (x < GRID_SIZE_Y - y) x++;
                else y--;
                break;
            }
          }
        }

        // add creatures
        populate(this);
      }
    }
  }
}

function connectBlobs(map) {
  // a "blob" is a set of linked rooms
  const blobs = getBlobs(map);
  if (blobs.length === 1) return;

  let connected = false;
  for (let blob of blobs) {
    for (let loc of blob) {
      // see if there is an adjacent that is not part of this blob
      const {x, y} = loc;
      const adjacentLocs = {
        n: map[x][y-1],
        e: map[x+1] && map[x+1][y],
        s: map[x][y+1],
        w: map[x-1] && map[x-1][y]
      }
      for (let dir in adjacentLocs) {
        const adjacentLoc = adjacentLocs[dir];
        if (adjacentLoc && !blob.includes(adjacentLoc)) {
          loc.connect(dir, adjacentLoc);
          connected = true;
          break;
        }
      }
      if (connected) break;
    }
    if (connected) break;
  }
  if (connected) connectBlobs(map);
}

function getBlobs(map) {
  const blobs = [], visited = new Set();
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[x].length; y++) {
      const loc = map[x][y];
      if (loc && !visited.has(loc)) {
        // breadth first search
        const blob = [], queue = [loc];
        while (queue.length) {
          let i = queue.shift();
          if (!visited.has(i)) {
            visited.add(i);
            blob.push(i);
            queue.push(...Object.keys(i.exits).map(dir => i.exits[dir]));
          }
        }
        blobs.push(blob);
      }
    }
  }
  return blobs;
}

function visualize(map) {
  let rows = Array(GRID_SIZE_Y * 2).fill("");
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[x].length; y++) {
      const loc = map[x][y];
      if (loc) {
        const east = map[x+1] && map[x+1][y], south = map[x][y+1];

        if (east && loc.exits.e) rows[y*2] += "X-";
        else rows[y*2] += "X "

        if (south && loc.exits.s) rows[y*2+1] += "| ";
        else rows[y*2+1] += "  "
      } else {
        rows[y*2] += "  ";
        rows[y*2+1] += "  ";
      }
    }
  }
  return rows.join("\n");
}

function populate(world) {
  // temporary
  const Ifrit = require("./creatures/Ifrit");
  new Ifrit(world.startingLocation);
}

module.exports = World;