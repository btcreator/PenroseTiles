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
  occupy = {
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
Kite.prototype.anglesDot = {
  // inner closed angle in the dots
  A: 72,
  B: 72,
  C: 144,
  D: 72,
};

class Dart extends PenroseTile {
  name = "dart";
  static anglesRef = {
    // side agle to x axis
    a: 0,
    b: 144,
    c: 108,
    d: 252,
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
Dart.prototype.anglesDot = {
  // inner closed angle in the dots
  A: 72,
  B: 36,
  C: 216,
  D: 36,
};

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
    const actPointIndex = PenroseTile.points.indexOf(tilePoint);
    const direction = this.#calcDirection();
    for (let i = 0; i < 4; i++) {
      const actPoint = PenroseTile.points[(actPointIndex + i) % 4];
      const coord = tile.coord[actPoint];
      const dot = this.#getPointDot(coord);
      const conDirection = direction(tile, actPoint, dot);
      dot.addTile(tile, actPoint, conDirection);
      tile.addDot(actPoint, dot);
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

  #calcDirection() {
    let flag = 0; // the direction begins always with 0 (ccw or 360 degree dot). By new dot or by the dot which reaches 360 degree its no matter it is cw or ccw.
    return function (tile, point, dot) {
      const tileAngle = tile.anglesDot[point];
      if (!flag) {
        return tileAngle + dot.degTotal === 360 ? flag : flag++; // When the dot total degree is not 360 then the tile is attached ccw (0) to this dot and after that all can be attached cw (1)
      }
      return flag;
    };
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

  #renderTile(tileToDraw) {
    console.log(tileToDraw);
    this.#undoneTiles.push(tileToDraw);
    //call function which creates the 2D path from tile and coordinates
    const path = this.#createPath(tileToDraw);
    //fill the created path
    ctx.fillStyle = this.#randomColor();
    ctx.beginPath();
    ctx.fill(path);
  }

  #makeTileDone(actTile) {
    try {
      for (const [side, occupy] of Object.entries(actTile.occupy)) {
        if (occupy) continue;
        const nextTile = this.#nextRuledTile(actTile, side); // return an object like {name: "kite", side: "b"} or throw error
        this.#calcAndCreate(actTile, side, nextTile);
        actTile.occupy[side] = nextTile;
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

  #fillSideOccupy(tile) {
    let i = 0;
    for (const [point, dot] of Object.entries(tile.dots)) {
      const index = dot.occupy.findIndex((element) => element[0] === tile);
      const actSide = point.toLowerCase();
      let neigTile, neigPoint, neigSide;
      let flag = false;

      if (index !== dot.occupy.length - 1) {
        // if the tile is not the last in the dot occupy list, that mean there is next neighbour element...
        [neigTile, neigPoint] = dot.occupy[index + 1];
        flag = true;
      } else if (dot.degTotal === 360) {
        // When the tile is the last, but the dot is closed (there is no gap in tiles) then there are a neighbour element, which is the first element.

        [neigTile, neigPoint] = dot.occupy[0];
        flag = true;
      } // When the tile is the last, and there is no closed dot (i.e. on the actual side is nothing/gap) then the occupy is still null and the flag stays false
      if (flag) {
        // when there is occupation, change it, when not, then all stays on null
        neigSide = PenroseTile.points
          .at(PenroseTile.points.indexOf(neigPoint) - 1)
          .toLowerCase();
        tile.occupy[actSide] = { name: neigTile.name, side: neigSide };
        neigTile.occupy[neigSide] = { name: tile.name, side: actSide };
      }

      i++;
    }
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
    nextPenroseTile.moveToPos(newTilePosX, newTilePosY);

    // dot controller - add dots to all points, add tile to dots
    this.dotController.fillDots(nextPenroseTile, touchPointNextTile);
    // check for side occupation and fill when needed
    this.#fillSideOccupy(nextPenroseTile);

    // render tile.
    this.#renderTile(nextPenroseTile);
  }

  tileCoordinator(tile, x, y, rotation = 0) {
    const firstTile = this.#createTile(tile, rotation);
    firstTile.moveToPos(x, y);
    this.dotController.fillDots(firstTile, "A");
    this.#renderTile(firstTile);
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
