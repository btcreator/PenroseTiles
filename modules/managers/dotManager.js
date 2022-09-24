import { randomRange } from '../helpers';
import PenroseTile from '../tiles/penroseTile';
import Dot from '../dots/dot.js';

// all is for the search purposes in the dots by id.
// open is for the dots which are not done (no 360 degree occupation) and have one or more possible tiles to attach (on both sides of the gap)
// restricted is for the dots where just one possible tile can be attached on min one side of the gap - these dots must be processed first! (These are elemnts of open too.)
let allDots = {}; // {584-875: DotObj, 698-41: DotObj,...}
let inviewOpenDots = []; // [Dot Object, Dot Object,...]
let openDots = []; // [Dot Object, Dot Object,...]
let restrictedDots = []; // [Dot Object, Dot Object,...]
let border;
let scaleBase;
let borderOverlay;

export const init = function (firstTile, visibleArea, scale) {
    border = visibleArea;
    scaleBase = scale;
    borderOverlay = scale * Math.sin((36 * Math.PI) / 180) * 2;
    setDots(firstTile, 'A', 1);
};

export const getInviewOpenDots = function () {
    return inviewOpenDots;
};

const getTileDataByDot = function (dot, n, coffin = { shortSide: false, worm: undefined }) {
    const { tiles: newTileData, dir: attacheDirection } = dot.nextPossTiles;
    const targetTileData = dot.occupy.at(attacheDirection - 1);

    if (coffin.shortSide) {
        if (coffin.worm) {
            if (/A|B/.test(targetTileData.point) && targetTileData.tile.name === 'kite') {
                n = newTileData[n].name === targetTileData.tile.name ? (n + 1) % 2 : n;
            } else {
                n = newTileData[n].name != targetTileData.tile.name ? (n + 1) % 2 : n;
            }
        } else {
            if (/A|B/.test(targetTileData.point) && targetTileData.tile.name === 'kite') {
                n = newTileData[n].name != targetTileData.tile.name ? (n + 1) % 2 : n;
            } else {
                n = newTileData[n].name === targetTileData.tile.name ? (n + 1) % 2 : n;
            }
        }
    }

    return {
        newTileName: newTileData[n].name,
        newTileTouchPoint: newTileData[n].point,
        targetTile: targetTileData.tile,
        targetTouchPoint: targetTileData.point,
        attacheDirection,
    };
};

const calcSquare = function (dotA, dotB) {
    return Math.round(
        Math.round(
            ((dotB.coord[0] - dotA.coord[0]) ** 2 + (dotB.coord[1] - dotA.coord[1]) ** 2) * 100
        ) / 100
    );
};

const checkDotPresenceOnShortSides = function (dotToCheck, dotA, dotB) {
    // dotB is always the corner on which can be generated a random tile, because we attach tile by CW direction and this is attached on the long side from here (the dotB is in CW direction from dotA)
    if (dotToCheck === dotB) return false;

    // sun 0.31, max sun 0.438, star 0.5, max star 0.71   * scale
    const offset = dotA.occupy[0].point === 'C' ? 0.37 * scaleBase : 0.6 * scaleBase;

    return dotToCheck.coord.every((xyP, i) => {
        let xyA, xyB;

        if (dotB.coord[i] > dotA.coord[i]) {
            xyB = dotB.coord[i] + offset;
            xyA = dotA.coord[i] - offset;
        } else {
            xyB = dotB.coord[i] - offset;
            xyA = dotA.coord[i] + offset;
        }

        return (xyP - xyA) * (xyP - xyB) < 0;
    });
};

const verticesRuleReferee = function (openDot) {
    // search for corners
    const coffinSetup = { shortSide: false, worm: undefined };
    const corners = openDots.filter(dot => {
        return (
            dot.totalDegree === 72 ||
            dot.occupy.every((occupationObj, i) => {
                return (
                    occupationObj.tile.name === 'kite' &&
                    (i
                        ? occupationObj.point === 'D'
                        : occupationObj.point === 'C' || occupationObj.point === 'B')
                );
            })
        );
    });

    // arrange corners in circular order: first sort in ascending order by X. The first and last corner is the middle cut line.
    // Reduce the corners which are under that line. These must be reverse and pushed to end of other corners. Now the corners are arranged in a circular order.
    corners.sort((cA, cB) => cA.coord[0] - cB.coord[0]);
    corners
        .reduce(
            (function () {
                const x1 = corners[0].coord[0];
                const y1 = corners[0].coord[1];
                const x2 = corners.at(-1).coord[0];
                const y2 = corners.at(-1).coord[1];

                return function (acc, corner, i) {
                    const position =
                        (corner.coord[0] - x1) * (y2 - y1) - (corner.coord[1] - y1) * (x2 - x1);

                    position > 0 && acc.unshift(i);
                    return acc;
                };
            })(),
            []
        )
        .forEach(index => corners.push(...corners.splice(index, 1)));

    // filter and handle the shapes with 4 corners
    const acuteAnglesIndex = corners.reduce((acc, corner, i) => {
        corner.totalDegree === 72 && acc.push(i);
        return acc;
    }, []);

    if (acuteAnglesIndex.length === 2) {
        !acuteAnglesIndex[0] && acuteAnglesIndex[1] === 3 && acuteAnglesIndex.reverse(); //when the first and last elements are the acute corners, revers, because that would be arranged in opposite direction.

        const sideA = calcSquare(corners.at(acuteAnglesIndex[0] - 1), corners[acuteAnglesIndex[0]]);
        const sideB = calcSquare(
            corners.at(acuteAnglesIndex[0] - 2),
            corners.at(acuteAnglesIndex[0] - 1)
        );

        // if the length of the two sides of the romboid shape are the same, then its a rhombus,
        // when the sideB is greater (which by coffin shape is the short side), then its a trapezoid, when the sideA, then its an isosceles trapezoid (cup shape)
        if (sideB >= sideA) return coffinSetup;

        // "normal" cup shapes have smaller ratio than the longer ones, which are the shapes that we should care about
        const ratio = sideA / sideB;

        coffinSetup.shortSide =
            ratio > 12 &&
            checkDotPresenceOnShortSides(
                openDot,
                corners.at(acuteAnglesIndex[0] - 1),
                corners.at(acuteAnglesIndex[0] - 2)
            );
        // the tile setup on corners is sun = 0 or star = 1, which decide the worm attaching
        coffinSetup.worm = corners.at(acuteAnglesIndex[0] - 1).occupy[0].point != 'C';

        return coffinSetup;
    }

    // handling of the 5 corner shapes
    const cornersMap = corners.reduce((acc, val, i) => {
        const actSquare = calcSquare(corners.at(i - 1), val);
        const dots = acc.get(actSquare);
        dots ? dots.push([corners.at(i - 1), val]) : acc.set(actSquare, [[corners.at(i - 1), val]]);
        return acc;
    }, new Map());
    // pentagon
    if (cornersMap.size === 1) return coffinSetup;

    // coffin / roof  or (else) hybrid roof
    let smallestSideDots;
    if (cornersMap.size === 3) {
        // take smallest one (one, or two equal side lengths)
        smallestSideDots = cornersMap.get(Math.min(...cornersMap.keys()));
    } else {
        // take smallest two, because two different side lengths are to take care of
        const smallestSquare = Math.min(...cornersMap.keys());
        smallestSideDots = cornersMap.get(smallestSquare);
        cornersMap.delete(smallestSquare);
        smallestSideDots.push(...cornersMap.get(Math.min(...cornersMap.keys())));
    }

    coffinSetup.shortSide = smallestSideDots.some(dots =>
        checkDotPresenceOnShortSides(openDot, ...dots)
    );
    coffinSetup.worm = smallestSideDots[0][0].occupy[0].point != 'C';

    return coffinSetup;
};

const getOpenPosition = function () {
    const randomOpenDot = inviewOpenDots.at(randomRange(inviewOpenDots.length - 1));
    const verticesRule = verticesRuleReferee(randomOpenDot);
    const randomPossTileIndex = randomRange(1);

    return getTileDataByDot(randomOpenDot, randomPossTileIndex, verticesRule);
};

const getRestrictedPosition = function () {
    return getTileDataByDot(restrictedDots[0], 0);
};

export const getNextTileBlueprint = function () {
    return restrictedDots[0] ? getRestrictedPosition() : getOpenPosition();
};

const directionCoordinator = function (initShiftState) {
    let shift = !initShiftState;
    return function (tile, point, dot) {
        const tileAngle = tile.pointAngles[point];
        if (tileAngle + dot.totalDegree === 360) {
            shift = true;
        } else shift = dot.totalDegree ? !shift : false;

        return Number(shift);
    };
};

const getDotByCoord = function (coord) {
    let dot = allDots[Dot.getID(coord)];
    if (!dot) {
        dot = new Dot(coord);
        allDots[dot.id] = dot;
        openDots.push(dot);
    }
    return dot;
};

const dotToString = function (dot) {
    return dot.occupy
        .map(dotOccupiedTile => `${dotOccupiedTile.tile.name} ${dotOccupiedTile.point}`)
        .join('');
};

const tileTxtToObject = function (uniqPossibleTxtTiles) {
    const tilesOnCcw = uniqPossibleTxtTiles[0].map(tileTxt => {
        const [name, point] = tileTxt.split(' ');
        return { name, point };
    });
    const tilesOnCw = uniqPossibleTxtTiles[1].map(tileTxt => {
        const [name, point] = tileTxt.split(' ');
        return { name, point };
    });
    return [tilesOnCcw, tilesOnCw];
};

const vertexRuleReferee = function (dot) {
    const dotTxt = dotToString(dot);
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

    const uniqPossibleTxtTiles = possibleNextTiles.map(arrToSet => Array.from(new Set(arrToSet)));

    const uniqPossibleTiles = tileTxtToObject(uniqPossibleTxtTiles);
    return {
        ccw: uniqPossibleTiles[0],
        cw: uniqPossibleTiles[1],
    };
};

const borderControl = function (dot) {
    // if the dot is outside the overlayed border, return false (the whole tile should be not rendered)
    const dotInRenderZone = dot.coord.every(
        (xy, i) => xy > 0 - borderOverlay && xy < border[i] + borderOverlay
    );
    if (!dotInRenderZone) return 0;

    // the dot is inside the borders of viewport, return true (the whole tile must be rendered)
    const dotInViewport = dot.coord.every((xy, i) => xy > 0 && xy < border[i]);
    if (dotInViewport) return 1;

    // the other dots are in the overlay between viewport border and the not rendering zone
    // calculate the absolute x y value/distances from a corner (no matter which corner, the coordinates are absolute)
    let [absX, absY] = dot.coord;
    absX = border[0] / 2 - Math.abs(border[0] / 2 - Math.abs(absX));
    absY = border[1] / 2 - Math.abs(border[1] / 2 - Math.abs(absY));

    // pitagoras comes handy by calculating the dot distance from the origo of the corner
    const distanceFromTheCorner = Math.sqrt(absX ** 2 + absY ** 2);
    return distanceFromTheCorner < borderOverlay ? -1 : -2;
};

// could be made faster? first check dot.occupy.length === 1   ==>  indexes are -1
const organizeDot = function (dot) {
    if (dot.borderPermission === undefined) {
        dot.borderPermission = borderControl(dot);
        dot.borderPermission % 2 && inviewOpenDots.push(dot);
    }

    const indexOfRestrictedDot = restrictedDots.indexOf(dot);
    indexOfRestrictedDot > -1 && restrictedDots.splice(indexOfRestrictedDot, 1);

    if (dot.totalDegree === 360) {
        openDots.splice(openDots.indexOf(dot), 1);
        dot.borderPermission % 2 && inviewOpenDots.splice(inviewOpenDots.indexOf(dot), 1);

        dot.nextPossTiles = { ccw: [], cw: [] };
        return;
    }

    const possTilesByRule = vertexRuleReferee(dot);
    (possTilesByRule.cw.length === 1 || possTilesByRule.ccw.length === 1) &&
        restrictedDots.push(dot);

    dot.nextPossTiles = possTilesByRule;
    return;
};

export const setDots = function (newTile, newTileTouchPoint, attacheDirection) {
    const directionShifter = directionCoordinator(attacheDirection); // arguments(tile,point,dot)
    const tileRenderSetup = {
        renderable: false,
        succeed: false,
    };

    let point = newTileTouchPoint;
    let gapWatchdog = 0;
    let renderable = -1;

    while (!newTile.dots[point]) {
        const dot = getDotByCoord(newTile.coord[point]);
        const direction = directionShifter(newTile, point, dot);

        dot.addTile(newTile, point, direction);
        newTile.addDot(dot, point);
        organizeDot(dot);

        if (renderable < 0)
            renderable =
                !(renderable % 2) && !(dot.borderPermission > -1)
                    ? renderable
                    : dot.borderPermission;

        dot.occupy.length > 1 && dot.totalDegree < 360 && gapWatchdog++;
        if (gapWatchdog > 2) return tileRenderSetup;

        point = PenroseTile.getNeigPointN(point);
    }

    tileRenderSetup.renderable = Boolean(renderable);
    tileRenderSetup.succeed = true;
    return tileRenderSetup;
};

const removeDot = function (dot) {
    const indexOfRestrictedDot = restrictedDots.indexOf(dot);

    delete allDots[dot.id];
    openDots.splice(openDots.indexOf(dot), 1);
    dot.borderPermission % 2 && inviewOpenDots.splice(inviewOpenDots.indexOf(dot), 1);
    indexOfRestrictedDot > -1 && restrictedDots.splice(indexOfRestrictedDot, 1);
};

export const redefineDot = function (dotToAudit, tile) {
    if (dotToAudit.occupy.length === 1) {
        removeDot(dotToAudit);
        return;
    }

    if (dotToAudit.totalDegree === 360) {
        openDots.push(dotToAudit);
        dotToAudit.borderPermission % 2 && inviewOpenDots.push(dotToAudit);
    }

    dotToAudit.removeTile(tile);
    organizeDot(dotToAudit);
};

export const clear = function () {
    for (let dotId in Object.keys(allDots)) {
        // todo why dont work
        delete allDots[dotId];
    }

    allDots = {}; // debug
    openDots.splice(0);
    restrictedDots.splice(0);
};
