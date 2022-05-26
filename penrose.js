"use strict";

const canvas = document.querySelector(".myCanvas");
const ctx = canvas.getContext("2d");
let width = (canvas.width = innerWidth);
let height = (canvas.height = innerHeight);
ctx.clearRect(0, 0, width, height);

class PenroseTiles {
  coord = {};
  scaleTile(by) {
    for (let [dot, coord] of Object.entries(this.coord)) {
      coord[0] *= by;
      coord[1] *= by;
    }
  }

  toRad(deg) {
    return (deg * Math.PI) / 180;
  }
}
PenroseTiles.prototype.phi = (1 + Math.sqrt(5)) / 2;

class Dart extends PenroseTiles {
  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.#rotateDart(this.rotation);
  }

  #rotateDart(rotation) {
    const rotInRad = this.toRad(rotation);
    this.coord.A = [0, 0];
    this.coord.B = [
      Math.cos(rotInRad) * this.phi,
      Math.sin(rotInRad) * this.phi,
    ];
    this.coord.C = [
      Math.cos(this.toRad(rotation + 36)),
      Math.sin(this.toRad(rotation + 36)),
    ];
    this.coord.D = [
      Math.cos(this.toRad(rotation + 72)) * this.phi,
      Math.sin(this.toRad(rotation + 72)) * this.phi,
    ];
  }
}

class Kite extends PenroseTiles {
  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.#rotateKite(this.rotation);
  }

  #rotateKite(rotation) {
    this.coord.A = [0, 0];
    this.coord.B = this.#rotateBCD(0, rotation);
    this.coord.C = this.#rotateBCD(1, rotation);
    this.coord.D = this.#rotateBCD(2, rotation);
  }

  #rotateBCD(multipl, rotation) {
    const rotInRad = this.toRad(multipl * 36 + rotation);
    return [Math.cos(rotInRad) * this.phi, Math.sin(rotInRad) * this.phi];
  }
}
const randomTint = function () {
  return Math.ceil(Math.random() * 255);
};

const randomColor = function () {
  return `rgb(${randomTint()}, ${randomTint()}, ${randomTint()})`;
};

const createPath = function (tile, x, y) {
  const path = new Path2D();
  for (const [dot, coord] of Object.entries(tile.coord))
    dot === "A"
      ? path.moveTo(coord[0] + x, coord[1] + y)
      : path.lineTo(coord[0] + x, coord[1] + y);

  path.closePath();
  return path;
};

const renderTile = function (tile, x, y, rotation = 0) {
  //create new tile with rotation
  const tileToDraw = tile === "kite" ? new Kite(rotation) : new Dart(rotation);
  tileToDraw.scaleTile(80);
  //call function which creates the 2D path from tile and coordinates
  const path = createPath(tileToDraw, x, y);
  //fill the created path
  ctx.fillStyle = randomColor();
  ctx.beginPath();
  ctx.fill(path);
};

renderTile("kite", 300, 150, 288);
renderTile("dart", 50, 50, 20);
