"use strict";

const canvas = document.querySelector(".myCanvas");
const ctx = canvas.getContext("2d");
let width = (canvas.width = innerWidth);
let height = (canvas.height = innerHeight);
ctx.clearRect(0, 0, width, height);

class Helper {
  constructor() {}

  // random number btw. min and max
  randomRange(max, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
  }

  // generates a random color
<<<<<<< HEAD
  randomColor() {
    const tint = this.randomRange(230, 100);
    return `rgb(${tint}, ${tint}, ${tint})`;
=======
  randomColor(tileName) {
    return tileName === "kite" ? `#ffffff` : `#000000`;
    // const tint = this.randomRange(250, 200);
    // const tint1 = this.randomRange(40, 20);
    // const tint2 = this.randomRange(40, 20);
    // return `rgb(${tint}, ${tint1}, ${tint2})`;
>>>>>>> newLogicApproach
  }
}

/**********************************************
 * Legend *************************************
 * Point: The point of the tile. This is just a character of the side joints "A", "B"...
 * Dot: This joins tile points together to a node. Dots are the joint points of more tiles.
<<<<<<< HEAD
 * Direction 1 means always Clockwise
 * Direction 0 means always Counterclockwise
=======
 * Direction 1 means Clockwise
 * Direction 0 means Counterclockwise
>>>>>>> newLogicApproach
 */

class PenroseTile {
  static points = ["A", "B", "C", "D"];

  // the rule: 7 different tile kombination is possible around one dot. Each possibility is listed here with possible tile
  // and point joining to the dot in the right order, in clockwise direction. After the last element comes the first one.
  // It means, this tiles goes in round.
  static dotConnRules = [
    ["dart A", "dart A", "dart A", "dart A", "dart A"],
    ["dart C", "kite D", "kite B"],
    ["kite A", "kite A", "kite A", "kite A", "kite A"],
    ["dart A", "dart A", "dart A", "kite B", "kite D"],
    ["kite C", "dart D", "kite A", "kite A", "dart B"],
    ["dart A", "kite B", "kite D", "kite B", "kite D"],
    ["dart B", "kite C", "kite C", "dart D"],
  ];
  coord = {}; // {A: [254,854], B: [658,78],...D: [658,74]}

<<<<<<< HEAD
  // Te occupation of the points with dots.
=======
  // The occupation of the points with dots.
>>>>>>> newLogicApproach
  dots = {
    A: null,
    B: null,
    C: null,
    D: null,
  };

  // get neighbour point (-n: previous n-th, n: next n-th)
  static getNeigPointN(initPoint, n = 1) {
    return this.points.at((this.points.indexOf(initPoint) + n) % 4);
  }

  // add the dot to the corresponding point
  addDot(dot, point) {
    this.dots[point] = dot;
  }

  // scale tile (before rendering)
  scaleTile(by) {
    for (let [_, coord] of Object.entries(this.coord)) {
      coord[0] *= by;
      coord[1] *= by;
    }
    return this;
  }

  // move tile to x,y position (before rendering)
  moveToPos(x, y) {
    for (const [_, coord] of Object.entries(this.coord)) {
      coord[0] += x;
      coord[1] += y;
    }
    return this;
  }

  // degree to radian converter
  toRad(deg) {
    return (deg * Math.PI) / 180;
  }
}
PenroseTile.prototype.phi = (1 + Math.sqrt(5)) / 2;

class Kite extends PenroseTile {
  name = "kite";

  // the closed agle of the side to the x axis (to the ref. axis)
  static refAngles = {
    a: 0,
    b: 108,
    c: 144,
    d: 252,
  };

  // rotation 0 mean, the 'a' side closes 0 deg with the x axis. This is the initial position of the tile.
  // rotation goes ccw
  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.#rotateKite(this.rotation);
  }

  // calculate the initial coordinates after rotation.
  #rotateKite(rotation) {
    this.coord.A = [0, 0];
    this.coord.B = this.#clacBCD(0, rotation);
    this.coord.C = this.#clacBCD(1, rotation);
    this.coord.D = this.#clacBCD(2, rotation);
  }

  // calculate the initial coordinates of BCD points. The ref. point is A in [0,0].
  #clacBCD(multipl, rotation) {
    const rotInRad = this.toRad(multipl * 36 + rotation);
    return [Math.cos(rotInRad) * this.phi, Math.sin(rotInRad) * this.phi];
  }
}

// inner closed angle in the points (i.e. B: the angle closed by the 'a' and 'b' sides)
Kite.prototype.pointAngles = {
  A: 72,
  B: 72,
  C: 144,
  D: 72,
};

class Dart extends PenroseTile {
  name = "dart";

  // the closed agle of the side to the x axis (to the ref. axis)
  static refAngles = {
    a: 0,
    b: 144,
    c: 108,
    d: 252,
  };

  // rotation 0 mean, the 'a' side closes 0 deg with the x axis. This is the initial position of the tile.
  // rotation goes ccw
  constructor(rotation = 0) {
    super();
    this.rotation = rotation;
    this.#rotateDart(this.rotation);
  }

  // calculate the initial coordinates after rotation.
  #rotateDart(rotation) {
    this.coord.A = [0, 0];
    this.coord.B = this.#calcBCD(0, rotation);
    this.coord.C = this.#calcBCD(1, rotation);
    this.coord.D = this.#calcBCD(2, rotation);
  }

  // calculate the initial coordinates of BCD points. The ref. point is A in [0,0].
  #calcBCD(multipl, rotation) {
    const rotInRad = this.toRad(multipl * 36 + rotation);
    const distance = multipl % 2 || this.phi;
    return [Math.cos(rotInRad) * distance, Math.sin(rotInRad) * distance];
  }
}

// inner closed angle in the points (i.e. B: the angle closed by the 'a' and 'b' sides)
Dart.prototype.pointAngles = {
  A: 72,
  B: 36,
  C: 216,
  D: 36,
};

class Dot {
  // *** id is needed for track the dot when we create a new tile. ( the id is created from the coordinates,
  // i.e. when we create a new tile we can then check the exixtence of the dots at the new coordinates).
  // *** occupy track the joined tiles to the dot (tile and the point)
  // *** totalDegree is for track, the dot is full or not. When it reaches 360, then the dot is done, no more tile can be added
  // *** nextPossTiles is for save the possible tiles that can be attached to the dot. (We would search for "just one attachable"
  // dots first of all.)
  #id;
  occupy = []; // [{tile: TileObj, point: "A"},{tile: TileObj, point: "B"},...]
  #totalDegree = 0;
  #nextPossTiles = {
    ccw: [], // [{name: "kite", point: "A"}, {name: "dart", point: "B"}]
    cw: [],
  };

  constructor(coord) {
    this.#id = Dot.getID(coord);
  }

  get id() {
    return this.#id;
  }

  get totalDegree() {
    return this.#totalDegree;
<<<<<<< HEAD
  }

  riseTotalDegree(degree) {
    this.#totalDegree += degree;
=======
>>>>>>> newLogicApproach
  }

  static getID(coord) {
    const adjCoord = coord.map((xy) => Math.round(xy * 100) / 100); // adjusted because of floating point failure
    return `${Math.round(adjCoord[0])}-${Math.round(adjCoord[1])}`;
  }

  // the tiles are listed in cw direction in the occupy variable. Between the last and first element is the gap.
  // When a new tile is added, the dir gives where the tile is attached. It would be the new last or first element.
  // dir 1 is attached cw, 0 ccw from the gaps point of view.
  addTile(tile, tilePoint, dir) {
    dir
      ? this.occupy.unshift({ tile, point: tilePoint })
      : this.occupy.push({ tile, point: tilePoint });
    this.#totalDegree += tile.pointAngles[tilePoint];
  }

<<<<<<< HEAD
  // as next possible tiles by the gaps on both sides (cw or ccw) gives back the one, which has just 1 possibilities.
  // when both have just one or two, in that caseits no matter which one is returned (in our case is that always the
=======
  removeTile(tile) {
    const index = this.occupy.findIndex(
      (occupationObj) => occupationObj.tile === tile
    );
    const point = this.occupy[index].point;

    this.#totalDegree -= tile.pointAngles[point];
    this.occupy.splice(index, 1);
  }

  // as next possible tiles by the gaps on both sides (cw or ccw) gives back the one, which has just 1 possibilities.
  // when both have just one or two, in that case its no matter which one is returned (in our case is that always the
>>>>>>> newLogicApproach
  // possibilites on cw side).
  get nextPossTiles() {
    return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
      ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
      : { tiles: this.#nextPossTiles.cw, dir: 1 };
<<<<<<< HEAD
=======

    // return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
    //   ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
    //   : { tiles: this.#nextPossTiles.cw, dir: 1 };
>>>>>>> newLogicApproach
  }
  set nextPossTiles(possTilesByRule) {
    this.#nextPossTiles.ccw = possTilesByRule.ccw;
    this.#nextPossTiles.cw = possTilesByRule.cw;
  }
}

class DotManager {
  // all is for the search purposes in the dots by id.
  // open is for the dots which are not done (no 360 degree occupation) and have one or more possible tiles to attach (on both sides of the gap)
  // restricted is for the dots where just one possible tile can be attached on min one side of the gap - these dots must be processed first! (These are elemnts of open too.)
  #allDots = {}; // {584-875: DotObj, 698-41: DotObj,...}
  #openDots = []; // [Dot Object, Dot Object,...]
<<<<<<< HEAD
  #restrictedDots = [];
=======
  #restrictedDots = []; // [Dot Object, Dot Object,...]
>>>>>>> newLogicApproach

  constructor() {
    this.help = new Helper();
  }

  init(firstTile) {
<<<<<<< HEAD
    //continue
=======
    this.setDots(firstTile, "A", 1);
>>>>>>> newLogicApproach
  }

  get openDots() {
    return this.#openDots;
  }

  #getTileDataByDot(dot, n) {
    const { tiles: newTileData, dir: attacheDirection } = dot.nextPossTiles;
    const targetTileData = dot.occupy.at(attacheDirection - 1);

    return {
      newTileName: newTileData[n].name,
      newTileTouchPoint: newTileData[n].point,
      targetTile: targetTileData.tile,
      targetTouchPoint: targetTileData.point,
      attacheDirection,
    };
  }

  #getRestrictedPosition() {
    return this.#getTileDataByDot(this.#restrictedDots[0], 0);
  }

  #getOpenPosition() {
    const random = this.help.randomRange(1);
    return this.#getTileDataByDot(this.#openDots[0], random);
  }

  getNextTileBlueprint() {
    return this.#restrictedDots[0]
      ? this.#getRestrictedPosition()
      : this.#getOpenPosition();
  }

  #directionCoordinator(initShiftState) {
<<<<<<< HEAD
    let shift = Boolean(initShiftState);
    return function (tile, point, dot) {
      const tileAngle = tile.pointAngles[point];
      shift =
        (tileAngle + dot.totalDegree === 360 || dot.totalDegree) === shift;
=======
    let shift = !initShiftState;
    return function (tile, point, dot) {
      const tileAngle = tile.pointAngles[point];
      if (tileAngle + dot.totalDegree === 360) {
        shift = true;
      } else shift = dot.totalDegree ? !shift : false;

>>>>>>> newLogicApproach
      return Number(shift);
    };
  }

  #getDotByCoord(coord) {
<<<<<<< HEAD
    let dot = this.#openDots[Dot.getID(coord)];
=======
    let dot = this.#allDots[Dot.getID(coord)];
>>>>>>> newLogicApproach
    if (!dot) {
      dot = new Dot(coord);
      this.#allDots[dot.id] = dot;
    }
    return dot;
  }

  #dotToString(dot) {
    return dot.occupy
      .map(
        (dotOccupiedTile) =>
          `${dotOccupiedTile.tile.name} ${dotOccupiedTile.point}`
      )
      .join("");
  }

<<<<<<< HEAD
  #dotRuleReferee(dot) {
    const dotTxt = this.#dotToString(dot);
    const regexpForNextCCWTile = new RegExp(`.{6}(?=${dotTxt})`, "g");
    const regexpForNextCWTile = new RegExp(`(?<=${dotTxt}).{6}`, "g");

    const possibleNextTiles = PenroseTile.dotConnRules.reduce(
      (collector, rule) => {
        const ruleTxt = rule.join("");
        ruleTxt += ruleTxt;
        const arr = [
          [...ruleTxt.matchAll(regexpForNextCCWTile)],
          [...ruleTxt.matchAll(regexpForNextCWTile)],
=======
  #tileTxtToObject(uniqPossibleTxtTiles) {
    const tilesOnCcw = uniqPossibleTxtTiles[0].map((tileTxt) => {
      const [name, point] = tileTxt.split(" ");
      return { name, point };
    });
    const tilesOnCw = uniqPossibleTxtTiles[1].map((tileTxt) => {
      const [name, point] = tileTxt.split(" ");
      return { name, point };
    });
    return [tilesOnCcw, tilesOnCw];
  }

  #dotRuleReferee(dot) {
    const dotTxt = this.#dotToString(dot);
    const regexpForNextCWTile = new RegExp(`.{6}(?=${dotTxt})`, "g");
    const regexpForNextCCWTile = new RegExp(`(?<=${dotTxt}).{6}`, "g");

    const possibleNextTiles = PenroseTile.dotConnRules.reduce(
      (collector, rule) => {
        let ruleTxt = rule.join("");
        ruleTxt += ruleTxt;
        const arr = [
          [...ruleTxt.matchAll(regexpForNextCCWTile)].map((val) => val[0]),
          [...ruleTxt.matchAll(regexpForNextCWTile)].map((val) => val[0]),
>>>>>>> newLogicApproach
        ];

        return collector.map((val, i) => val.concat(arr[i]));
      },
      [[], []]
    );

<<<<<<< HEAD
    const uniqPossibleTiles = possibleNextTiles.map((arrToSet) =>
      Array.from(new Set(arrToSet))
    );

    return { ccw: uniqPossibleTiles[0], cw: uniqPossibleTiles[1] };
  }

  #organizeDot(dot) {
    const possTilesByRule = this.#dotRuleReferee(dot);
=======
    const uniqPossibleTxtTiles = possibleNextTiles.map((arrToSet) =>
      Array.from(new Set(arrToSet))
    );

    const uniqPossibleTiles = this.#tileTxtToObject(uniqPossibleTxtTiles);
    return {
      ccw: uniqPossibleTiles[0],
      cw: uniqPossibleTiles[1],
    };
  }

  // could be made faster? first check dot.occupy.length === 1   ==>  indexes are -1
  #organizeDot(dot) {
    const indexOfOpenDot = this.#openDots.indexOf(dot);
    const indexOfRestrictedDot = this.#restrictedDots.indexOf(dot);

    indexOfRestrictedDot > -1
      ? this.#restrictedDots.splice(indexOfRestrictedDot, 1)
      : indexOfOpenDot > -1 && this.#openDots.splice(indexOfOpenDot, 1);

    if (dot.totalDegree === 360) {
      indexOfRestrictedDot > -1 && this.#openDots.splice(indexOfOpenDot, 1);
      dot.nextPossTiles = { ccw: [], cw: [] };
      return;
    }

    const possTilesByRule = this.#dotRuleReferee(dot);
    (possTilesByRule.cw.length === 1 || possTilesByRule.ccw.length === 1) &&
      this.#restrictedDots.push(dot);
    indexOfRestrictedDot < 0 && this.#openDots.push(dot);

>>>>>>> newLogicApproach
    dot.nextPossTiles = possTilesByRule;
  }

  setDots(newTile, newTileTouchPoint, attacheDirection) {
    const directionShifter = this.#directionCoordinator(attacheDirection); // arguments(tile,point,dot)

    let point = newTileTouchPoint;
<<<<<<< HEAD
=======
    let gapWatchdog = 0;
>>>>>>> newLogicApproach

    while (!newTile.dots[point]) {
      const dot = this.#getDotByCoord(newTile.coord[point]);
      const direction = directionShifter(newTile, point, dot);

      dot.addTile(newTile, point, direction);
      newTile.addDot(dot, point);

      this.#organizeDot(dot);
<<<<<<< HEAD
      point = PenroseTile.getNeigPointN(point);
    }
=======
      dot.occupy.length > 1 && dot.totalDegree < 360 && gapWatchdog++;
      if (gapWatchdog > 2) return false;

      point = PenroseTile.getNeigPointN(point);
    }
    return true;
  }

  #removeDot(dot) {
    const indexOfOpenDot = this.#openDots.indexOf(dot);
    const indexOfRestrictedDot = this.#restrictedDots.indexOf(dot);

    delete this.#allDots[dot.id];
    indexOfRestrictedDot > -1 &&
      this.#restrictedDots.splice(indexOfRestrictedDot, 1);
    indexOfOpenDot > -1 && this.#openDots.splice(indexOfOpenDot, 1);
  }

  redefineDot(dotToAudit, tile) {
    if (dotToAudit.occupy.length === 1) {
      this.#removeDot(dotToAudit);
      return;
    }
    dotToAudit.removeTile(tile);
    this.#organizeDot(dotToAudit);
>>>>>>> newLogicApproach
  }
}

class TileManager {
  // allTiles is the container for all created Tiles
  #allTiles = []; // [TileObj, TileObj, ...]

  constructor() {}

  init(firstTileName, x, y, rotation) {
    const firstTile = this.#createRawTile(firstTileName, rotation).moveToPos(
      x,
      y
    );
    this.#allTiles.push(firstTile);
    return firstTile;
  }

  // get the initial angle of the required side
  #getAngle(tileName, side) {
    return tileName === "kite" ? Kite.refAngles[side] : Dart.refAngles[side];
  }

  // each point joins two sides together. This returns the corresponding side based on the attaching direction
  #convPointToSide(touchPoint, dir) {
    return dir
      ? touchPoint.toLowerCase()
      : PenroseTile.getNeigPointN(touchPoint, -1).toLowerCase();
  }

  // calculation: bring the two tile sides to the same angle level (angleTargetTile - angleNewTile => the new Tile side is now parallel with the target side - just on initial state).
  // Turn around the tile (+180). Now the tiles dont cover each other. At the end just rotate to the actual target position (+targetTile.rotation)
  #getRotation(newTileName, newTileContactSide, targetTile, targetContactSide) {
    const angleTargetTile = this.#getAngle(targetTile.name, targetContactSide);
    const angleNewTile = this.#getAngle(newTileName, newTileContactSide);
<<<<<<< HEAD
    return angleTargetTile - angleNewTile + 180 + targetTile.rotation;
=======
    return (angleTargetTile - angleNewTile + 180 + targetTile.rotation) % 360;
>>>>>>> newLogicApproach
  }

  // calculate the finally x,y position of a new Tile. The point "A" is the ref point.
  #calcXYcoords(
    newTileCoord,
    newTileTouchPoint,
    targetTileCoord,
    targetTouchPoint
  ) {
    // shorter, but hurts for readability: return newTileCoord[newTileTouchPoint].map((touchPointCoord, i) => targetTileCoord[targetTouchPoint][i] - touchPointCoord);
    const newTilePosX =
      targetTileCoord[targetTouchPoint][0] - newTileCoord[newTileTouchPoint][0];
    const newTilePosY =
      targetTileCoord[targetTouchPoint][1] - newTileCoord[newTileTouchPoint][1];
    return [newTilePosX, newTilePosY];
  }

  #createRawTile(tileName, rotation) {
    const newTile =
      tileName === "kite" ? new Kite(rotation) : new Dart(rotation);
<<<<<<< HEAD
    newTile.scaleTile(70);
=======
    newTile.scaleTile(8);
>>>>>>> newLogicApproach
    return newTile;
  }

  //  create the next deployable tile, which is rotated and moved to required position.
  setTile(
    newTileName,
    newTileTouchPoint,
    targetTile,
    targetTouchPoint,
    attacheDirection
  ) {
    const targetContactSide = this.#convPointToSide(
      targetTouchPoint,
      !attacheDirection
    );
<<<<<<< HEAD
=======

>>>>>>> newLogicApproach
    const newTileContactSide = this.#convPointToSide(
      newTileTouchPoint,
      attacheDirection
    );

    const newTileRotation = this.#getRotation(
      newTileName,
      newTileContactSide,
      targetTile,
      targetContactSide
    );
    const newPenroseTile = this.#createRawTile(newTileName, newTileRotation);

    const newTilePos = this.#calcXYcoords(
      newPenroseTile.coord,
      newTileTouchPoint,
      targetTile.coord,
      targetTouchPoint
    );
    newPenroseTile.moveToPos(...newTilePos);

    this.#allTiles.push(newPenroseTile);
    return newPenroseTile;
  }
<<<<<<< HEAD
=======

  discardTile(tile) {
    const indexOfTileToRemove = this.#allTiles.lastIndexOf(tile);
    this.#allTiles.splice(indexOfTileToRemove, 1);
  }
>>>>>>> newLogicApproach
}

class RenderView {
  constructor() {
    this.help = new Helper();
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

  renderTile(tileToDraw) {
    const path = this.#createPath(tileToDraw);

<<<<<<< HEAD
    ctx.fillStyle = this.help.randomColor();
=======
    ctx.fillStyle = this.help.randomColor(tileToDraw.name);
>>>>>>> newLogicApproach
    ctx.beginPath();
    ctx.fill(path);
  }
}

class Controller {
  constructor() {
    this.dotManager = new DotManager();
    this.tileManager = new TileManager();
    this.view = new RenderView();
<<<<<<< HEAD
  }

  init(tileName, x, y, rotation) {
    const firstTile = this.tileManager.init(tileName, x, y, rotation);
    this.dotManager.init(firstTile);
    this.#mainLoop();
  }

=======
  }

  init(tileName, x, y, rotation) {
    const firstTile = this.tileManager.init(tileName, x, y, rotation);
    this.dotManager.init(firstTile);
    this.view.renderTile(firstTile);
    this.#mainLoop();
  }

  // Happens from 20000 tiles ca. 10 times
  #removeElement(tile) {
    this.tileManager.discardTile(tile);

    for (let dotToAudit of Object.values(tile.dots)) {
      if (!dotToAudit) continue;
      this.dotManager.redefineDot(dotToAudit, tile);
    }
    return null;
  }

>>>>>>> newLogicApproach
  // This function gets an object, a blueprint of new Tile. Based on that, creates a new Tile, loaded with all necessary data like coordinates, Point occupation with dots.
  // (i.e. return a "redy to render" tile)
  #createElement({
    newTileName,
    newTileTouchPoint,
    targetTile,
    targetTouchPoint,
    attacheDirection,
  }) {
    const newTile = this.tileManager.setTile(
      newTileName,
      newTileTouchPoint,
      targetTile,
      targetTouchPoint,
      attacheDirection
    );

<<<<<<< HEAD
    this.dotManager.setDots(newTile, newTileTouchPoint, attacheDirection);

    return newTile;
  }

  #mainLoop() {
    let xx = 2;
=======
    const setDotsSucceed = this.dotManager.setDots(
      newTile,
      newTileTouchPoint,
      attacheDirection
    );

    return setDotsSucceed ? newTile : this.#removeElement(newTile);
  }

  #mainLoop() {
    let xx = 20000;
>>>>>>> newLogicApproach
    while (xx) {
      //this.dotManager.openDots.length
      const nextTileBlueprint = this.dotManager.getNextTileBlueprint();
      const nextTile = this.#createElement(nextTileBlueprint);
<<<<<<< HEAD
      this.view.renderTile(nextTile);
=======
      nextTile && this.view.renderTile(nextTile);
>>>>>>> newLogicApproach
      xx--;
    }
  }
}

const pattern = new Controller();
<<<<<<< HEAD
pattern.init("kite", 500, 500, 20);

//todo

/**continue dot manager init
 * sort dots in dotOrganizer to open or restricted
 * rise totalDegree
 * remove if 360
 * rearrange from open to restricted or other way if needed
 *
 * init can be made with constructor?
=======
pattern.init("dart", 500, 350, 45);

/**init can be made with constructor?
>>>>>>> newLogicApproach
 * PenroseTile.points to helper?
 */
