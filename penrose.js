'use strict';

class Helper {
    constructor() {}

    // random number btw. min and max
    randomRange(max, min = 0) {
        return Math.round(Math.random() * (max - min)) + min;
    }
}

class ColorMaker {
    #colors;

    constructor() {
        this.help = new Helper();
    }

    setPalette(colorPalette) {
        this.#colors = colorPalette;
    }

    getColor(tile) {
        return tile.name === 'kite' ? this.#colors.kiteColor : this.#colors.dartColor;
        /*
//rotated gradient coloring
        const maxGradWidth = width - 100;
        const maxGradHeight = height - 100;
        const colorSpread = 80;
        const maxcolorAdd = 255 - colorSpread;
        let diff = 15;

        let minS = (Math.abs(tile.coord.A[0]) / maxGradWidth) * colorSpread; // 99,37
        //minS = minS > colorSpread ? colorSpread : minS;
        let maxS = (1 - Math.abs(tile.coord.A[0]) / maxGradWidth) * maxGradHeight; //1
        maxS = maxS < 1 ? 1 : maxS;

        let spreadVertical = colorSpread - minS;
        spreadVertical = spreadVertical < 1 ? 1 : spreadVertical;
        let grad = (Math.abs(tile.coord.A[1]) / maxS) * spreadVertical;
        grad += minS;

        const tint = this.help.randomRange(grad + maxcolorAdd, grad + maxcolorAdd - diff);
        return `rgb(${tint}, ${tint}, ${tint})`;
        */
    }

    // generates a random color
    #randomColor(rgbRange) {
        const tint1 = this.help.randomRange(rgbRange.red.max, rgbRange.red.min);
        const tint2 = this.help.randomRange(rgbRange.green.max, rgbRange.green.min);
        const tint3 = this.help.randomRange(rgbRange.blue.max, rgbRange.blue.min);
        return `rgb(${tint1}, ${tint2}, ${tint3})`;
    }
}

/**********************************************
 * Legend *************************************
 * Point: The point of the tile. This is just a character of the side joints "A", "B"...
 * Dot: This joins tile points together to a node. Dots are the joint points of more tiles.
 * Direction 1 means Clockwise
 * Direction 0 means Counterclockwise
 */

class PenroseTile {
    static points = ['A', 'B', 'C', 'D'];

    // the rule: 7 different tile kombination is possible around one dot. Each possibility is listed here with possible tile
    // and point joining to the dot in the right order, in clockwise direction. After the last element comes the first one.
    // It means, this tiles goes in round.
    static dotConnRules = [
        ['dart A', 'dart A', 'dart A', 'dart A', 'dart A'],
        ['dart C', 'kite D', 'kite B'],
        ['kite A', 'kite A', 'kite A', 'kite A', 'kite A'],
        ['dart A', 'dart A', 'dart A', 'kite B', 'kite D'],
        ['kite C', 'dart D', 'kite A', 'kite A', 'dart B'],
        ['dart A', 'kite B', 'kite D', 'kite B', 'kite D'],
        ['dart B', 'kite C', 'kite C', 'dart D'],
    ];
    coord = {}; // {A: [254,854], B: [658,78],...D: [658,74]}

    // The occupation of the points with dots.
    dots = {
        A: null,
        B: null,
        C: null,
        D: null,
    };

    constructor() {}

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
    name = 'kite';

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
    name = 'dart';

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
    #coord; // [154.4555, 456.87452]
    occupy = []; // [{tile: TileObj, point: "A"},{tile: TileObj, point: "B"},...]
    #totalDegree = 0;
    #nextPossTiles = {
        ccw: [], // [{name: "kite", point: "A"}, {name: "dart", point: "B"}]
        cw: [],
    };

    constructor(coord) {
        this.#id = Dot.getID(coord);
        this.#coord = coord;
    }

    get id() {
        return this.#id;
    }

    get coord() {
        return this.#coord;
    }

    get totalDegree() {
        return this.#totalDegree;
    }

    static getID(coord) {
        const adjCoord = coord.map(xy => Math.round(xy * 100) / 100); // adjusted because of floating point failure
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

    removeTile(tile) {
        const index = this.occupy.findIndex(occupationObj => occupationObj.tile === tile);
        const point = this.occupy[index].point;

        this.#totalDegree -= tile.pointAngles[point];
        this.occupy.splice(index, 1);
    }

    // as next possible tiles by the gaps on both sides (cw or ccw) gives back the one, which has just 1 possibilities.
    // when both have just one or two, in that case its no matter which one is returned (in our case is that always the
    // possibilites on cw side).
    get nextPossTiles() {
        return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
            ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
            : { tiles: this.#nextPossTiles.cw, dir: 1 };

        // return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
        //   ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
        //   : { tiles: this.#nextPossTiles.cw, dir: 1 };
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
    #restrictedDots = []; // [Dot Object, Dot Object,...]
    #border;

    constructor() {
        this.help = new Helper();
    }

    init(firstTile, visibleArea) {
        this.#border = visibleArea;
        this.setDots(firstTile, 'A', 1);
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
        return this.#restrictedDots[0] ? this.#getRestrictedPosition() : this.#getOpenPosition();
    }

    #directionCoordinator(initShiftState) {
        let shift = !initShiftState;
        return function (tile, point, dot) {
            const tileAngle = tile.pointAngles[point];
            if (tileAngle + dot.totalDegree === 360) {
                shift = true;
            } else shift = dot.totalDegree ? !shift : false;

            return Number(shift);
        };
    }

    #getDotByCoord(coord) {
        let dot = this.#allDots[Dot.getID(coord)];
        if (!dot) {
            dot = new Dot(coord);
            this.#allDots[dot.id] = dot;
        }
        return dot;
    }

    #dotToString(dot) {
        return dot.occupy
            .map(dotOccupiedTile => `${dotOccupiedTile.tile.name} ${dotOccupiedTile.point}`)
            .join('');
    }

    #tileTxtToObject(uniqPossibleTxtTiles) {
        const tilesOnCcw = uniqPossibleTxtTiles[0].map(tileTxt => {
            const [name, point] = tileTxt.split(' ');
            return { name, point };
        });
        const tilesOnCw = uniqPossibleTxtTiles[1].map(tileTxt => {
            const [name, point] = tileTxt.split(' ');
            return { name, point };
        });
        return [tilesOnCcw, tilesOnCw];
    }

    #dotRuleReferee(dot) {
        const dotTxt = this.#dotToString(dot);
        const regexpForNextCWTile = new RegExp(`.{6}(?=${dotTxt})`, 'g');
        const regexpForNextCCWTile = new RegExp(`(?<=${dotTxt}).{6}`, 'g');

        const possibleNextTiles = PenroseTile.dotConnRules.reduce(
            (collector, rule) => {
                let ruleTxt = rule.join('');
                ruleTxt += ruleTxt;
                const arr = [
                    [...ruleTxt.matchAll(regexpForNextCCWTile)].map(val => val[0]),
                    [...ruleTxt.matchAll(regexpForNextCWTile)].map(val => val[0]),
                ];

                return collector.map((val, i) => val.concat(arr[i]));
            },
            [[], []]
        );

        const uniqPossibleTxtTiles = possibleNextTiles.map(arrToSet =>
            Array.from(new Set(arrToSet))
        );

        const uniqPossibleTiles = this.#tileTxtToObject(uniqPossibleTxtTiles);
        return {
            ccw: uniqPossibleTiles[0],
            cw: uniqPossibleTiles[1],
        };
    }

    #borderControl(dot) {
        return dot.coord.every((xy, i) => xy > 0 && xy < this.#border[i]);
    }

    // could be made faster? first check dot.occupy.length === 1   ==>  indexes are -1
    #organizeDot(dot) {
        const borderPermission = this.#borderControl(dot);

        const indexOfOpenDot = this.#openDots.indexOf(dot);
        const indexOfRestrictedDot = this.#restrictedDots.indexOf(dot);

        indexOfRestrictedDot > -1
            ? this.#restrictedDots.splice(indexOfRestrictedDot, 1)
            : indexOfOpenDot > -1 && this.#openDots.splice(indexOfOpenDot, 1);

        if (dot.totalDegree === 360) {
            indexOfRestrictedDot > -1 &&
                borderPermission &&
                this.#openDots.splice(indexOfOpenDot, 1);
            dot.nextPossTiles = { ccw: [], cw: [] };
            return borderPermission;
        }

        const possTilesByRule = this.#dotRuleReferee(dot);
        (possTilesByRule.cw.length === 1 || possTilesByRule.ccw.length === 1) &&
            this.#restrictedDots.push(dot);
        indexOfRestrictedDot < 0 && borderPermission && this.#openDots.push(dot);

        dot.nextPossTiles = possTilesByRule;
        return borderPermission;
    }

    setDots(newTile, newTileTouchPoint, attacheDirection) {
        const directionShifter = this.#directionCoordinator(attacheDirection); // arguments(tile,point,dot)
        const tileRenderSetup = {
            renderable: false,
            succeed: false,
        };

        let point = newTileTouchPoint;
        let gapWatchdog = 0;

        while (!newTile.dots[point]) {
            const dot = this.#getDotByCoord(newTile.coord[point]);
            const direction = directionShifter(newTile, point, dot);

            dot.addTile(newTile, point, direction);
            newTile.addDot(dot, point);

            tileRenderSetup.renderable = this.#organizeDot(dot) ? true : tileRenderSetup.renderable;

            dot.occupy.length > 1 && dot.totalDegree < 360 && gapWatchdog++;
            if (gapWatchdog > 2) return tileRenderSetup;

            point = PenroseTile.getNeigPointN(point);
        }
        tileRenderSetup.succeed = true;
        return tileRenderSetup;
    }

    #removeDot(dot) {
        const indexOfOpenDot = this.#openDots.indexOf(dot);
        const indexOfRestrictedDot = this.#restrictedDots.indexOf(dot);

        delete this.#allDots[dot.id];
        indexOfRestrictedDot > -1 && this.#restrictedDots.splice(indexOfRestrictedDot, 1);
        indexOfOpenDot > -1 && this.#openDots.splice(indexOfOpenDot, 1);
    }

    redefineDot(dotToAudit, tile) {
        if (dotToAudit.occupy.length === 1) {
            this.#removeDot(dotToAudit);
            return;
        }
        dotToAudit.removeTile(tile);
        this.#organizeDot(dotToAudit);
    }

    clear() {
        this.#allDots = {};
        this.#openDots = [];
        this.#restrictedDots = [];
    }
}

class TileManager {
    // allTiles is the container for all created Tiles
    #allTiles = []; // [TileObj, TileObj, ...]
    #scale = 20;

    constructor() {}

    init(firstTileName, x, y, rotation, scale) {
        this.#scale = scale;
        const firstTile = this.#createRawTile(firstTileName, rotation).moveToPos(x, y);
        this.#allTiles.push(firstTile);
        return firstTile;
    }

    // get the initial angle of the required side
    #getAngle(tileName, side) {
        return tileName === 'kite' ? Kite.refAngles[side] : Dart.refAngles[side];
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
        return (angleTargetTile - angleNewTile + 180 + targetTile.rotation) % 360;
    }

    // calculate the finally x,y position of a new Tile. The point "A" is the ref point.
    #calcXYcoords(newTileCoord, newTileTouchPoint, targetTileCoord, targetTouchPoint) {
        // shorter, but hurts for readability: return newTileCoord[newTileTouchPoint].map((touchPointCoord, i) => targetTileCoord[targetTouchPoint][i] - touchPointCoord);
        const newTilePosX =
            targetTileCoord[targetTouchPoint][0] - newTileCoord[newTileTouchPoint][0];
        const newTilePosY =
            targetTileCoord[targetTouchPoint][1] - newTileCoord[newTileTouchPoint][1];
        return [newTilePosX, newTilePosY];
    }

    #createRawTile(tileName, rotation) {
        const newTile = tileName === 'kite' ? new Kite(rotation) : new Dart(rotation);
        newTile.scaleTile(this.#scale);
        return newTile;
    }

    //  create the next deployable tile, which is rotated and moved to required position.
    setTile(newTileName, newTileTouchPoint, targetTile, targetTouchPoint, attacheDirection) {
        const targetContactSide = this.#convPointToSide(targetTouchPoint, !attacheDirection);

        const newTileContactSide = this.#convPointToSide(newTileTouchPoint, attacheDirection);

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

    discardTile(tile) {
        const indexOfTileToRemove = this.#allTiles.lastIndexOf(tile);
        this.#allTiles.splice(indexOfTileToRemove, 1);
    }

    clear() {
        this.#allTiles = [];
    }
}

class InteractionView {
    #floatingMenu = document.querySelector('.floating-menu');
    #menuButton = document.querySelector('.hamburger');
    #settingsButtons = document.querySelector('.settings-buttons');
    #subMenu = document.querySelector('.sub-menu');
    #submenuChildren = Array.from(this.#subMenu.children);

    #formInputWidth = document.querySelector('#width');
    #formInputHeight = document.querySelector('#height');
    #formInputColorKite = document.querySelector('#color_kite');
    #formInputColorDart = document.querySelector('#color_dart');
    #formInputDensity = document.querySelector('#density');
    #formInputRotation = document.querySelector('#rotation');

    constructor() {
        this.#addHandlersToMenuItems();
    }

    #addHandlersToMenuItems() {
        this.#menuButton.addEventListener('click', () => {
            this.#menuButton.innerText = this.#menuButton.innerText === '≡' ? '×' : '≡';
            this.#floatingMenu.classList.toggle('slide');
            this.#clearSubMenu();
        });

        this.#settingsButtons.addEventListener('click', ev => {
            this.#subMenuWindowHandler(ev.target.dataset.type);
        });

        this.#formInputDensity.addEventListener('input', function () {
            this.parentElement.querySelector('.range-display').innerText = this.value;
        });
        this.#formInputRotation.addEventListener('input', function () {
            this.parentElement.querySelector('.range-display').innerText = `${this.value} deg`;
        });
    }

    #subMenuWindowHandler(subMenuName) {
        if (!subMenuName) return;
        const subMenuItem = document.querySelector(`.${subMenuName}`);
        this.#subMenu.classList.remove('hidden');

        if (subMenuItem.classList.contains('hidden')) {
            this.#submenuChildren.forEach(item => item.classList.add('hidden'));
            subMenuItem.classList.toggle('hidden');
        } else {
            this.#clearSubMenu();
        }
    }

    #clearSubMenu() {
        this.#submenuChildren.forEach(item => item.classList.add('hidden'));
        this.#subMenu.classList.add('hidden');
    }

    interactionHandler(patternGenerator) {
        this.#subMenu.addEventListener('submit', ev => {
            ev.preventDefault();

            const penroseSettings = {
                width: this.#formInputWidth.valueAsNumber || window.innerWidth,
                height: this.#formInputHeight.valueAsNumber || window.innerHeight,
                kiteColor: this.#formInputColorKite.value,
                dartColor: this.#formInputColorDart.value,
                density: this.#formInputDensity.valueAsNumber,
                rotation: this.#formInputRotation.valueAsNumber,
            };

            requestAnimationFrame(() => {
                this.#clearSubMenu();
                requestAnimationFrame(() => patternGenerator(penroseSettings));
            });
        });
    }

    setDownloadLink(SVGelement) {
        const svg = '<?xml version="1.0" encoding="utf-8"?>' + SVGelement;
        const blob = new Blob([svg]);
        const element = document.createElement('a');
        const container = document.querySelector('.download-link');
        element.innerText = 'Get SVG';
        element.download = 'myPenrose.svg';
        element.mimeType = 'image/svg+xml';
        element.href = window.URL.createObjectURL(blob);
        container.innerText = '';
        container.insertAdjacentElement('afterbegin', element);
    }
}

class RenderView {
    #SVGelement;

    constructor() {
        this.help = new Helper();
        this.colors = new ColorMaker();
        this.svgContainer = document.querySelector('.penrose-pattern-container');
    }
    init(visibleArea, colorPalette) {
        this.width = visibleArea[0];
        this.height = visibleArea[1];
        this.colors.setPalette(colorPalette);
        this.clearView();
    }

    #generateSVGpolygon(tile) {
        return `<polygon points="${Object.values(tile.coord).reduce(
            (acc, val) => acc + ' ' + val
        )}" style="fill:${this.colors.getColor(tile)};" />`;
    }

    addToSVG(tile) {
        this.#SVGelement += this.#generateSVGpolygon(tile);
    }

    renderSVG() {
        this.#SVGelement += '</svg>';
        this.svgContainer.insertAdjacentHTML('afterbegin', this.#SVGelement);
        return this.#SVGelement;
    }

    clearView() {
        this.svgContainer.innerText = '';
        this.#SVGelement = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${this.width}" height="${this.height}">`;
    }
}
// viewBox="0 0 ${this.width} ${this.height}
class Controller {
    constructor() {
        this.dotManager = new DotManager();
        this.tileManager = new TileManager();
        this.view = new RenderView();
        this.interact = new InteractionView();
        this.init();
    }

    init() {
        this.interact.interactionHandler(this.#patternGenerator.bind(this));
    }

    #patternGenerator(penroseSettings) {
        //generate random x,y first placing
        const tileName = Math.round(Math.random()) ? 'kite' : 'dart';

        const visibleArea = [penroseSettings.width, penroseSettings.height];
        const rotation = penroseSettings.rotation;
        const scale = penroseSettings.density;
        const colorPalette = {
            kiteColor: penroseSettings.kiteColor,
            dartColor: penroseSettings.dartColor,
        };

        const firstTile = this.tileManager.init(tileName, 100, 100, rotation, scale);

        this.view.init(visibleArea, colorPalette);
        this.dotManager.init(firstTile, visibleArea);
        this.view.addToSVG(firstTile);
        this.#mainLoop();
    }

    // Happens from 20000 tiles ca. 10 times
    #removeElement(tile) {
        this.tileManager.discardTile(tile);

        for (let dotToAudit of Object.values(tile.dots)) {
            if (!dotToAudit) continue;
            this.dotManager.redefineDot(dotToAudit, tile);
        }
    }

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

        const setDotsResult = this.dotManager.setDots(newTile, newTileTouchPoint, attacheDirection);

        !setDotsResult.succeed && this.#removeElement(newTile);

        return setDotsResult.renderable && setDotsResult.succeed && newTile;
    }

    #mainLoop() {
        let generatedTiles = 0;
        while (this.dotManager.openDots.length) {
            const nextTileBlueprint = this.dotManager.getNextTileBlueprint();
            const nextTileInsideBorders = this.#createElement(nextTileBlueprint);
            if (nextTileInsideBorders) this.view.addToSVG(nextTileInsideBorders);

            generatedTiles++;
        }
        this.interact.setDownloadLink(this.view.renderSVG());
        this.#clearManagers();
        console.log(generatedTiles);
    }

    #clearManagers() {
        this.tileManager.clear();
        this.dotManager.clear();
    }
}

const pattern = new Controller();

/**init can be made with constructor?
 * PenroseTile.points to helper??
 * generate a bit bigger pattern (issue on the corners, when two points outside of the border cuts the corner)
 * cancel button when it takes too long
 * show the estimated time to generate tiles
 */
