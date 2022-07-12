"use strict";

const canvas = document.querySelector(".myCanvas");
const ctx = canvas.getContext("2d");
let width = (canvas.width = innerWidth);
let height = (canvas.height = innerHeight);
ctx.clearRect(0, 0, width, height);

class PenroseTile {
  static points = ["A", "B", "C", "D"];
  static dotConnRules = [
    ["dart A", "dart A", "dart A", "dart A", "dart A"],
    ["dart C", "kite D", "kite B"],
    ["kite A", "kite A", "kite A", "kite A", "kite A"],
    ["dart A", "dart A", "dart A", "kite B", "kite D"],
    ["kite C", "dart D", "kite A", "kite A", "dart B"],
    ["dart A", "kite B", "kite D", "kite B", "kite D"],
    ["dart B", "kite C", "kite C", "dart D"],
  ];
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

  static getNeigPointN(initPoint, n = 1) {
    return this.points.at((this.points.indexOf(initPoint) + n) % 4);
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

  addTile(tile, tilePoint, dir) {
    dir
      ? this.occupy.unshift([tile, tilePoint])
      : this.occupy.push([tile, tilePoint]);
    this.#degTotal += tile.anglesDot[tilePoint];
  }
}

class DotControl {
  #openDots = {};
  constructor() {}

  fillDots(tile, tilePoint) {
    const direction = this.#calcDirection();
    for (let i = 0; i < 4; i++) {
      const actPoint = PenroseTile.getNeigPointN(tilePoint, i);
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

  #pointToSide(possTile, dir) {
    const split = possTile.split(" ");
    return possTile.replace(/[A,B,C,D]/m, 
    dir ? 
    split[1].toLowerCase() :
    PenroseTile.getNeigPointN(split[1], dir-1).toLowerCase());
  }

  #dotToString(dot) {
    return dot.occupy.map(tileOccup => `${tileOccup[0].name} ${tileOccup[1]}`);
  }

  #possTileByRule(rule, i, dotTxt, dotTxtPos, j=0) {
    if(rule[(i + 1) % rule.length] === dotTxt[j+1]) {
      return this.#possTileByRule(rule, i+1, dotTxt, dotTxtPos, j+1);
    }

    return dotTxt[j +1] ? "" :  // if false, it mean the value is undefined and it matched till the last element. The rule match!
    dotTxtPos ? 
    rule.at(i-j-1) : // if the tile is on the first position, return the tileTxt first before
    rule[(i+1)%rule.length]; //if the tile is on the last position, return the tileTxt last after
  }

  dotRuler(actTile, side) {
    const point = side.toUpperCase();
    const dotsTxt = [
      this.#dotToString(actTile.dots[point]),
      this.#dotToString(actTile.dots[PenroseTile.getNeigPointN(point)]),
    ];
    const possTileAll = PenroseTile.dotConnRules.reduce((collector, rule) => {
      const possTilesRule = rule.reduce((acc, val, i, rule) => {
        
        // by dotsTxt[0] return last ? tile i+1 : call this;
        // by 1 return equal(returned from prev call tile i-1) ? tile i-1 : ""; then we become the prev tile
        let possTile;
        if (dotsTxt[0][0] === val) {
          possTile = this.#possTileByRule(rule, i, dotsTxt[0], 0);
          possTile &&= this.#pointToSide(possTile, 0); 
          possTile && acc[0].push(possTile);
        }
        if (dotsTxt[1][0] === val) {
          possTile = this.#possTileByRule(rule, i, dotsTxt[1], 1);
          possTile &&= this.#pointToSide(possTile, 1);
          possTile && acc[1].push(possTile);
        }

        return acc;
      }, [[],[]]);
      
      return collector.map((val, i) => val.concat(possTilesRule[i]));
    }, [[],[]]);
      
    ;
    const uniqPossTiles = possTileAll.map(arrToSet => Array.from(new Set(arrToSet)));

    return uniqPossTiles;

    // dotsTxt[0]; // last tile in dotsTxt list
    // dotsTxt[1]; // first tile in dotsTxt list
  }
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
    const possTilesMatrix = this.dotController.dotRuler(actTile, side); // ["kite a", "dart d"]
    
    const nextTile = possTilesMatrix.reduce((acc, possTiles, i) => {
      if (!(acc.length || possTiles.length)) throw new Error(`Error in rule. Log: ${dotsTxt}`);
      //if(acc.length === 1 && possTiles.length === 1) acc[0] != possTiles[0] && this.#removeTile();
      return acc.length === 1 ? acc : possTiles;
    });

    const random = this.#randomRange(1);
    const nextTileSide = nextTile.length > 1 ? nextTile[random] : nextTile[0];
    const split = nextTileSide.split(" ");
    
    return { name: split[0], side: split[1] };
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
    const touchPointNextTile = PenroseTile.getNeigPointN(
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
    let test = 5;
    while (test) {
      //this.#undoneTiles.length
      const actTile = this.#undoneTiles.shift();
      this.#makeTileDone(actTile);
      test--;
    }
  }
}

const pattern = new PenroseTileControl();
pattern.tileCoordinator("kite", 500, 500);

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
