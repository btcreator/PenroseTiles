"use strict";

const canvas = document.querySelector(".myCanvas");
const ctx = canvas.getContext("2d");
let width = (canvas.width = innerWidth);
let height = (canvas.height = innerHeight);
ctx.clearRect(0, 0, width, height);

class PenroseTile {
  static points = ["A", "B", "C", "D"];
  coord = {};
  dots = {
    A: null,
    B: null,
    C: null,
    D: null,
  };
  occupation = {
    a: null,
    b: null,
    c: null,
    d: null,
  };

  static getNeigPoint(actPoint) {
    return this.points[(this.points.indexOf(actPoint) + 1) % 4];
  }

  addDot(point, dot) {
    this.dots[point] = dot;
    return this;
  }

  scaleTile(by) {
    for (let [dot, coord] of Object.entries(this.coord)) {
      coord[0] *= by;
      coord[1] *= by;
    }
  }

  moveToPos(x, y) {
    for (const [_, coord] of Object.entries(this.coord)) {
      coord[0] += x;
      coord[1] += y;
    }
  }

  toRad(deg) {
    return (deg * Math.PI) / 180;
  }
}
PenroseTile.prototype.phi = (1 + Math.sqrt(5)) / 2;
PenroseTile.prototype.restriction = {
  // first is opposite side, second is self side tile i.e. Kite a side can be matched with dart a or kite d.
  kite: {
    a: ["a", "d"],
    b: ["b", "c"],
    c: ["c", "b"],
    d: ["d", "a"],
  },
  dart: {
    a: ["a", "d"],
    b: ["b"],
    c: ["c"],
    d: ["d", "a"],
  },
};

class Kite extends PenroseTile {
  name = "kite";
  static anglesRef = {
    // side agle to x axis
    a: 0,
    b: 108,
    c: 144,
    d: 252,
  };
  static anglesDot = {
    // inner closed angle in the dots
    A: 72,
    B: 72,
    C: 144,
    D: 72,
  };
  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.rotateKite(this.rotation);
  }
  rotateKite(rotation) {
    this.coord.A = [0, 0];
    this.coord.B = this.#clacBCD(0, rotation);
    this.coord.C = this.#clacBCD(1, rotation);
    this.coord.D = this.#clacBCD(2, rotation);
  }

  #clacBCD(multipl, rotation) {
    const rotInRad = this.toRad(multipl * 36 + rotation);
    return [Math.cos(rotInRad) * this.phi, Math.sin(rotInRad) * this.phi];
  }
}

class Dart extends PenroseTile {
  name = "dart";
  static anglesRef = {
    // side agle to x axis
    a: 0,
    b: 144,
    c: 108,
    d: 252,
  };
  static anglesDot = {
    // inner closed angle in the dots
    A: 72,
    B: 36,
    C: 216,
    D: 36,
  };

  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.rotateDart(this.rotation);
  }

  rotateDart(rotation) {
    this.coord.A = [0, 0];
    this.coord.B = this.#calcBCD(0, rotation);
    this.coord.C = this.#calcBCD(1, rotation);
    this.coord.D = this.#calcBCD(2, rotation);
  }

  #calcBCD(multipl, rotation) {
    const rotInRad = this.toRad(multipl * 36 + rotation);
    const distance = multipl % 2 || this.phi;
    return [Math.cos(rotInRad) * distance, Math.sin(rotInRad) * distance];
  }
}

class Dot {
  #id;
  occupy = [];
  #degTotal = 0;
  constructor(coord) {
    this.#id = Dot.getID(coord);
  }

  get id() {
    return this.#id;
  }

  get degTotal() {
    return this.#degTotal;
  }

  static getID(coord) {
    return `${Math.round(coord[0])}-${Math.round(coord[1])}}`;
  }

  addTile(tile, tileDot, dir) {
    dir
      ? this.occupy.unshift([tile, tileDot])
      : this.occupy.push([tile, tileDot]);
    this.#degTotal += tile.anglesDot[tileDot];
  }
}

class DotControl {
  #openDots = {};
  constructor() {}

  fillDots(tile, tilePoint) {
    for (const [point, coord] of Object.entries(tile.coord)) {
      const dot = this.#getPointDot(coord);
      const conDirection = this.#calcDirection(tile, tilePoint, dot);
      dot.addTile(tile, point, conDirection);
      tile.addDot(point, dot);
    }
  }

  #getPointDot(coord) {
    let dot = this.#openDots[Dot.getID(coord)];
    // when dot is undefined (i.e. there is no dot at that point), then create new
    if (!dot) {
      dot = new Dot(coord);
      this.#openDots[dot.id] = dot;
    }
    return dot;
  }

  #calcDirection(tile, point, dir) {
    // continue
  }
  dotRuler() {}
}

class PenroseTileControl {
  #undoneTiles = [];
  #doneTiles = [];
  constructor() {
    this.dotController = new DotControl();
  }

  #randomRange(max, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
  }

  #randomColor() {
    const tint = this.#randomRange(230, 100);
    return `rgb(${tint}, ${tint}, ${tint})`;
  }

  #createPath(tile) {
    const path = new Path2D();
    for (const [dot, coord] of Object.entries(tile.coord))
      dot === "A"
        ? path.moveTo(coord[0], coord[1])
        : path.lineTo(coord[0], coord[1]);

    path.closePath();
    return path;
  }
  #createTile(tile, rotation) {
    const newTile = tile === "kite" ? new Kite(rotation) : new Dart(rotation);
    newTile.scaleTile(70);
    return newTile;
  }

  #renderTile(tileToDraw, x, y) {
    console.log(tileToDraw);
    this.#undoneTiles.push(tileToDraw);
    // move tile to position
    tileToDraw.moveToPos(x, y);
    //call function which creates the 2D path from tile and coordinates
    const path = this.#createPath(tileToDraw);
    //fill the created path
    ctx.fillStyle = this.#randomColor();
    ctx.beginPath();
    ctx.fill(path);
  }

  #makeTileDone(actTile) {
    try {
      for (const [side, occupy] of Object.entries(actTile.occupation)) {
        if (occupy) continue;
        const nextTile = this.#nextRuledTile(actTile, side); // return an object like {name: "kite", side: "b"} or throw error
        this.#calcAndCreate(actTile, side, nextTile);
        actTile.occupation[side] = nextTile;
      }
      this.#doneTiles.push(actTile);
    } catch (err) {
      console.log(`Penrose fail: ${err}`);
      this.#undoneTiles.unshift(actTile);
    }
  }

  #nextRuledTile(actTile, side) {
    const actTileName = actTile.name;
    const random = this.#randomRange(
      actTile.restriction[actTileName][side].length - 1
    );
    const nextTileSide = actTile.restriction[actTileName][side][random];

    return (actTileName === "kite" && random) ||
      (actTileName === "dart" && !random)
      ? { name: "kite", side: nextTileSide }
      : { name: "dart", side: nextTileSide };
  }

  #getAngle(tileName, side) {
    return tileName === "kite" ? Kite.anglesRef[side] : Dart.anglesRef[side];
  }

  #calcAndCreate(actTile, side, nextTile) {
    const angleActTile = this.#getAngle(actTile.name, side);
    const angleNextTile = this.#getAngle(nextTile.name, nextTile.side);
    // get points of touch.
    const touchPointActTile = side.toUpperCase();
    const touchPointNextTile = PenroseTile.getNeigPoint(
      nextTile.side.toUpperCase()
    );

    // create and rotate the next Tile on right position, on x y position of the actual Tile. Occupy the used side. Next must be moved along the x y coordinates...
    const nextTileRotation =
      angleActTile - angleNextTile + 180 + actTile.rotation;
    const nextPenroseTile = this.#createTile(nextTile.name, nextTileRotation);

    // dot controller - add dots to all points, add tile to dots
    this.dotController.fillDots(nextPenroseTile, touchPointNextTile);
    // check for side occupation and fill when needed
    nextPenroseTile.occupation[nextTile.side] = { name: actTile.name, side };

    // calculate offset to point A on x and y on both Tiles
    const offsetXactTile =
      actTile.coord[touchPointActTile][0] - actTile.coord.A[0];
    const offsetYactTile =
      actTile.coord[touchPointActTile][1] - actTile.coord.A[1];
    const offsetXnextTile =
      nextPenroseTile.coord[touchPointNextTile][0] - nextPenroseTile.coord.A[0];
    const offsetYnextTile =
      nextPenroseTile.coord[touchPointNextTile][1] - nextPenroseTile.coord.A[1];
    // join offsets, then calculate the new pos on the xy coord.
    const newTilePosX = actTile.coord.A[0] + offsetXactTile - offsetXnextTile;
    const newTilePosY = actTile.coord.A[1] + offsetYactTile - offsetYnextTile;
    // render tile.
    this.#renderTile(nextPenroseTile, newTilePosX, newTilePosY);
  }

  tileCoordinator(tile, x, y, rotation = 0) {
    const firstTile = this.#createTile(tile, rotation);
    this.#renderTile(firstTile, x, y);
    let test = 2;
    while (test) {
      //this.#undoneTiles.length
      const actTile = this.#undoneTiles.shift();
      this.#makeTileDone(actTile);
      test--;
    }
  }
}

const pattern = new PenroseTileControl();
pattern.tileCoordinator("dart", 250, 250);

// set one tile on x,y with rotation (in create process we need a function call which checks dot id's and give it to the new created one. For the other dots will be generated a new id)
// save that all created dots on dotOpen object {hs9ekdf-fds3raf3: {occupy: [[Tile, "B", 72],[Tile, "A", 36]], edgeDot: [gh9easdf-zus7rofg,we9ekdf-rts3raf3] }

// fillDot(dotName/id/); this check for tiles connected to the dot..
//..take the last tile (cw - last tile) give the data to check rules for next tile (actTile, side) side is the dot which connects -> one back for CW ("A" -> "d", "C" -> "b")
// the next tile must be checked for correct degree
// (when 360) then the dot is done -> push to dotClosed, remove dotOpen, clear edgeDot
// re-set new edgeDot for neighbour dots, and the new dot (3 of 4 should be shure exist)
// (when <360) re-set the edgeDot
// re-set new edgeDot for neighbour dot, and the new dot (2 of 4 should be shure exist)
// take the next dot.. fillDot(dotName)

/*
Kite:
A-B (a) -- B-A (a) / A-D (d)
B-C (b) -- C-B (b) / D-C (c)
C-D (c) -- D-C (c) / C-B (b)
D-A (d) -- A-D (d) / B-A (a)


Dart:
A-B (a) -- B-A (a) / A-D (d)
B-C (b) -- C-B (b)
C-D (c) -- D-C (c)
D-A (d) -- A-D (d) / B-A (a)



*/
