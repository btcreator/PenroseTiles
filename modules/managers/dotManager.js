/** This module
 * - set the dots for each point of a newly created tile (received as argument), when no dot exists on the points coordinates, create a new one
 * - add the dot to the tile dots property,
 * - add the tile to the dot occupy property.
 * - decides which tiles can be attached as next to the dots,
 * - which attached tiles to a dot are allowed to be rendered
 * - control the rules for the right placement (vertex rule, vertices rule)
 * - remove dot when necessary (the gap issue)
 * Some variable legend for dot holders:
 * - allDots - is for the search purposes in the dots by id. (check for a dot presence at a certain coordinates)
 * - inviewOpenDots - are the dots to which attached tiles can be rendered (i.e. to these dots attached tiles can be rendered. Depends on borderPermission)
 * - openDots - are the ALL dots which are not done (no 360 degree occupation) / a tile can be attached to it /
 * - restrictedDots - are the dots where just one possible tile can be attached on min one side (cw/ccw) - these dots must be processed first!
 *  the invewOpenDots and restrictedDots are elemnts of openDots too.
 */

import { randomRange } from '../helpers';
import PenroseTile from '../tiles/penroseTile';
import Dot from '../dots/dot.js';

let allDots = {}; // {584-875: DotObj, 698-41: DotObj,...}
const inviewOpenDots = []; // [Dot Object, Dot Object,...]
const openDots = []; // [Dot Object, Dot Object,...]
const restrictedDots = []; // [Dot Object, Dot Object,...]
let border; // [width, height]
let scaleBase;
let borderOverlay;

// set the initial settings, then set the dots for the first tile
export const init = function (firstTile, visibleArea, scale) {
    border = visibleArea;
    scaleBase = scale;
    borderOverlay = scale * Math.sin((36 * Math.PI) / 180) * 2;
    setDots(firstTile, 'A', 1);
};

export const getInviewOpenDots = function () {
    return inviewOpenDots;
};

// get the tile that is allowed to attache to the dot (the random number of n -0 or 1- is for choose the tile that can be attached to the dot- by restricted dots, the n is always 0. By open, it's random). 
const getTileDataByDot = function (dot, n, coffin = { shortSide: false, worm: false }) {
    const { tiles: newTileData, dir: attacheDirection } = dot.nextPossTiles;
    const targetTileData = dot.occupy.at(attacheDirection - 1);

    if (coffin.shortSide) {
        // when the dot lies on the short side (can't happen by calling with a restricted dot), then the worm placement decides that kite or dart is allowed to place to that dot. 
        // when the worm is true, then the corner formation is star (false = corner formation is sun). Then we look that the dot is one of the hotspots and based on that informations
        // we reset the variable n when necessary. Then the allowed tile data would be returned 
        n = coffin.worm ^ 
        (/A|B/.test(targetTileData.point) && targetTileData.tile.name === 'kite') ^ 
        (newTileData[n].name === targetTileData.tile.name) ? (n + 1) % 2 : n;
        // the next code is the same as the last line, but better readable
        /* if (coffin.worm) {
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
        } */
    }

    return {
        newTileName: newTileData[n].name,
        newTileTouchPoint: newTileData[n].point,
        targetTile: targetTileData.tile,
        targetTouchPoint: targetTileData.point,
        attacheDirection,
    };
};

// It's actually represents/calculate the "length" between dotA and dotB
// (I just let the square root off from the pitagoras formula for win a little performace. For the measurement reason it's unnecessary)
// 2xround for floating point fail correction
const calcSquare = function (dotA, dotB) {
    return Math.round(
        Math.round(
            ((dotB.coord[0] - dotA.coord[0]) ** 2 + (dotB.coord[1] - dotA.coord[1]) ** 2) * 100
        ) / 100
    );
};

// Check the dot is present on the short side of a coffin shape or not, which is essential for the vertices rule (dotA,dotB are the corners)
const checkDotPresenceOnShortSides = function (dotToCheck, dotA, dotB) {
    // Because we attach tile on CW direction, the tile attached to one of the corner dots (dotA or dotB) would be
    // always fall over the corner (on the other side of the shape), and this is always the dotB, to which can we attache randomly.
    if (dotToCheck === dotB) return false;

    // min sun 0.31, max sun 0.438, min star 0.5, max star 0.71   * scale (the offset must be between min and max - see documentation)
    const offset = dotA.occupy[0].point === 'C' ? 0.37 * scaleBase : 0.6 * scaleBase;

    return dotToCheck.coord.every((xyP, i) => {
        const offsetOp = dotB.coord[i] > dotA.coord[i] ? offset : -offset;
        const xyA = dotA.coord[i] - offsetOp;
        const xyB = dotB.coord[i] + offsetOp;

        return (xyP - xyA) * (xyP - xyB) < 0;
    });
};

// If the randomly chosen dot (openDot) lies on the short side of the coffin shape, then the worm placement would forces us which tile can be attached
// returned value is the coffinSetup, where we tell, that the dot lies on the short side or not and when yes, how the worm should be set.
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
    // if (corners.length < 4) return coffinSetup; // it works without this too, because just on the beginning can happen one constallation of 6 tiles which have 3 corners. (2dart/4kite a half star)

    // arrange corners in circular order: first sort in ascending order by the x coordinates. The first and last corner is the middle cut line.
    // Reduce the corners which are under the middle cut line. These must be reverse and pushed to end of other corners. Now the corners are arranged in a circular order.
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

    // just the all first tile can have a 3 acute angles then all shapes which have 4 corners, have 2 acute angles.
    // if (acuteAnglesIndex.length > 2) return coffinSetup; // it works without this line too, but I let it here as comment
    if (acuteAnglesIndex.length === 2) {
        // we take two sides and compare them which is longer/bigger. From this we know which shape we have. One corner of the two sides are the
        // same (joint -> acuteAnglesIndex[0]-1), and this can't be an acute angle. Because of this, when the first and last elements are the acute corners,
        // we must reverse, because then the joint corner would be an acute one. acuteAnglesIndex[0] - 1 = acuteAnglesIndex[1]
        !acuteAnglesIndex[0] && acuteAnglesIndex[1] === 3 && acuteAnglesIndex.reverse();

        const sideA = calcSquare(corners.at(acuteAnglesIndex[0] - 1), corners[acuteAnglesIndex[0]]);
        const sideB = calcSquare(
            corners.at(acuteAnglesIndex[0] - 2),
            corners.at(acuteAnglesIndex[0] - 1)
        );

        // if the length of the two sides of the romboid shape are the same, then it's a rhombus,
        // when the sideB is longer/bigger (which by coffin shape is the short side), then it's a trapezoid, when the sideA, then it's an isosceles trapezoid (cup shape)
        if (sideB >= sideA) return coffinSetup;

        // "normal" cup shapes have smaller ratio than the longer ones, which are the shapes that we should aware of
        // the number 12 to which is the ratio compared is the measurement by my own tests (ratios from small till big isoscelec trapezoids)
        const ratio = sideA / sideB;

        coffinSetup.shortSide =
            ratio > 12 &&
            checkDotPresenceOnShortSides(
                openDot,
                corners.at(acuteAnglesIndex[0] - 1),
                corners.at(acuteAnglesIndex[0] - 2)
            );
        // the tile setup on corners is sun = false or star = true, which decide the worm attaching
        coffinSetup.worm = corners.at(acuteAnglesIndex[0] - 1).occupy[0].point != 'C';

        return coffinSetup;
    }

    // handling of the 5 corner shapes
    // calculate each side length/size (square), then use the number as a key in the Map and as values the corners of that side. When othes side have the
    // same length, add the other corners to that same key. (265xx: [[corner1, corner2], [corner4, corner5]], 125xx: [[corner2, corner3], [corner3, corner4]],..)
    // I cosen the Map and not an object to reduce, because the size property after that was important
    const cornersMap = corners.reduce((acc, val, i) => {
        const actSquare = calcSquare(corners.at(i - 1), val);
        const cornerPairs = acc.get(actSquare);
        cornerPairs
            ? cornerPairs.push([corners.at(i - 1), val])
            : acc.set(actSquare, [[corners.at(i - 1), val]]);
        return acc;
    }, new Map());

    // pentagon - each side has the same length
    if (cornersMap.size === 1) return coffinSetup;

    // coffin / roof  or (else) hybrid roof
    let smallestSideCorners;
    if (cornersMap.size === 3) {
        // take smallest one, because these are the shortest sides (one, or two equal side lengths - coffin has one, the roof has two)
        smallestSideCorners = cornersMap.get(Math.min(...cornersMap.keys()));
    } else {
        // take smallest two, because two different side lengths are to take aware of (the hybrid roof has 2 shortest side which have not equal length)
        const smallestSquare = Math.min(...cornersMap.keys());
        smallestSideCorners = cornersMap.get(smallestSquare);
        cornersMap.delete(smallestSquare);
        smallestSideCorners.push(...cornersMap.get(Math.min(...cornersMap.keys())));
    }

    coffinSetup.shortSide = smallestSideCorners.some(cornerPair =>
        checkDotPresenceOnShortSides(openDot, ...cornerPair)
    );
    coffinSetup.worm = smallestSideCorners[0][0].occupy[0].point != 'C';

    return coffinSetup;
};

// when we reach a dead surface, the next tile is placed randomly to an open dot (inviewOpenDot). Random select a dot, check for the vertices rule (short side of coffin shape), 
// random select one of the possible tiles that can be attached (kite or dart / 0 or 1). Then based on the dot and the rule, we get a tile data (a "blueprint" of a tile).
const getOpenPosition = function () {
    const randomOpenDot = inviewOpenDots.at(randomRange(inviewOpenDots.length - 1));
    const verticesRule = verticesRuleReferee(randomOpenDot);
    const randomPossTileIndex = randomRange(1);

    return getTileDataByDot(randomOpenDot, randomPossTileIndex, verticesRule);
};

// get a tile data from the first restricted dot in the array. Here we are forced to place the one possible tile to the dot (a forced tile). No random selection from the restrictedDots
// because it makes no sense - the dead surface would be the same, just the gap issus would be much more (and cause slower performance too).
const getRestrictedPosition = function () {
    return getTileDataByDot(restrictedDots[0], 0);
};

// tiles are places till dead surface is reached i.e. till there are some restricted dots. Return the blueprint of the next tile to place.
export const getNextTileBlueprint = function () {
    return restrictedDots[0] ? getRestrictedPosition() : getOpenPosition();
};

// when in setDots we attache the new tile to each dot at its points, we must attache it sometimes in cw(1/true), sometimes in ccw(0/false) direction
// when we attache to a dot, which will be be a fully occupied dot (occupy of 360 degree), then the attache direction is cw (actually no matter, but we would have a problem when the initial dot is one of this dot).
// when it is a new dot (the tile is at this point not added to the dot, so totalDegree is still 0), the attache direction is ccw (yes, actually this one no matters too). After a 360 dot, to the next (not 360) must be attached in ccw
// so we switch the shift variable (!shift cw->ccw). After a new dot, to the next one (not new) must be attached cw, and like before, it is the same (!shift ccw->cw).
const attacheDirectionCoordinator = function (initShiftState) {
    let shift = !initShiftState;
    return function (tile, point, dot) {
        const tileAngle = tile.pointAngles[point];
        if (tileAngle + dot.totalDegree === 360) {
            shift = true;
        } else shift = dot.totalDegree ? !shift : false;

        return Number(shift);
    };
};

// when a dot is present on the coordinates, return that dot, when not, create and return the new dot
const getDotByCoord = function (coord) {
    let dot = allDots[Dot.getID(coord)];
    if (!dot) {
        dot = new Dot(coord);
        allDots[dot.id] = dot;
        openDots.push(dot);
    }
    return dot;
};

// convert the dot occupation to string
const dotOccupyToString = function (dot) {
    return dot.occupy
        .map(dotOccupiedTile => `${dotOccupiedTile.tile.name} ${dotOccupiedTile.point}`)
        .join('');
};

// return an object from text presented tiles ('Kite C' => {name: 'Kite', point: 'C'}),
// [['Kite A','Dart B'], ['Kite A','Dart B']]  =>  [[{name: 'Kite', point: 'A'},{name:...}], [{name:...},{...}]]
const tileTxtToObject = function (uniqPossibleTilesTxt) {
    const tilesOnCcw = uniqPossibleTilesTxt[0].map(tileTxt => {
        const [name, point] = tileTxt.split(' ');
        return { name, point };
    });
    const tilesOnCw = uniqPossibleTilesTxt[1].map(tileTxt => {
        const [name, point] = tileTxt.split(' ');
        return { name, point };
    });
    return [tilesOnCcw, tilesOnCw];
};

// the occupation is compared with the data in PenroseTiles vertexRules property, section to section till there is a match
// then look which tile comes as next and which as previous in the text/rule. The ones would be the possibleNextTiles on cw, others on the ccw direction.
// Reduce the data to an array, separated to cw and ccw possible tiles, from which are the doubles filtered out.
const vertexRuleReferee = function (dot) {
    const dotOccupyTxt = dotOccupyToString(dot);
    const regexpForNextCWTile = new RegExp(`.{6}(?=${dotOccupyTxt})`, 'g');
    const regexpForNextCCWTile = new RegExp(`(?<=${dotOccupyTxt}).{6}`, 'g');

    const possibleNextTiles = PenroseTile.vertexRules.reduce(
        (collector, rule) => {
            let ruleTxt = rule.join('');
            // the ruleTxt is doubled, because the tiles are occupied around a dot in circular way, so in reality, there is no first and last tile. So make we sure, that every possibility is checked/matched.
            ruleTxt += ruleTxt;
            const arr = [
                [...ruleTxt.matchAll(regexpForNextCCWTile)].map(val => val[0]),
                [...ruleTxt.matchAll(regexpForNextCWTile)].map(val => val[0]),
            ];

            return collector.map((val, i) => val.concat(arr[i]));
        },
        [[], []]
    );

    const uniqPossibleTilesTxt = possibleNextTiles.map(arrToSet => Array.from(new Set(arrToSet)));

    const uniqPossibleTiles = tileTxtToObject(uniqPossibleTilesTxt);
    return {
        ccw: uniqPossibleTiles[0],
        cw: uniqPossibleTiles[1],
    };
};

// each dot has its position on the pattern relative to the viewport. A dot can be inside of the viewport, in the not rendering zone, or in the overlay radius by the corners
// or just in the overlay (btw. the viewport and the not rendering zone). Based on his position, each dot get a value which we can use to decide which tiles are allowed to render or not.
const borderControl = function (dot) {
    // if the dot is outside the overlayed border, return 0/"false" (the whole tile should be not rendered)
    const dotInRenderZone = dot.coord.every(
        (xy, i) => xy > 0 - borderOverlay && xy < border[i] + borderOverlay
    );
    if (!dotInRenderZone) return 0;

    // the dot is inside the borders of viewport, return 1/"true" (the whole tile must be rendered)
    const dotInViewport = dot.coord.every((xy, i) => xy >= 0 && xy <= border[i]);
    if (dotInViewport) return 1;

    // the other dots are in the overlay, between viewport border and the not rendering zone.
    // calculate the absolute x y value/distances from a corner (no matter which corner, the coordinates are absolute)
    let [absX, absY] = dot.coord;
    absX = border[0] / 2 - Math.abs(border[0] / 2 - Math.abs(absX));
    absY = border[1] / 2 - Math.abs(border[1] / 2 - Math.abs(absY));

    // pitagoras comes handy by calculating the dot distance from the origo of the corner
    // when the dot is inside of the radius, return -1/"weak true", in other case -2/"weak false"
    const distanceFromTheCorner = Math.sqrt(absX ** 2 + absY ** 2);
    return distanceFromTheCorner < borderOverlay ? -1 : -2;
};

// organize mean, that a dot gets his border permission(just the new ones) and that, it would be reorganized in the dot holders (open, restricted, inviewOpen).
// At the end the vertex rule set his new possible tiles
const organizeDot = function (dot) {
    if (dot.borderPermission === void 0) {
        dot.borderPermission = borderControl(dot);
        dot.borderPermission % 2 && inviewOpenDots.push(dot);
    }
    // when the dot is a restricted dot, remove it from the array (when it would be again a restricted dot, then comes to the end of the array)
    // when a restricted dot gets a tile added, it was then served, and must go to the end (when it is again a restricted dot).
    // In each cycle (that a restricted dots are cycled through) each dot is served just one time, and so can we be sure, that the gap issue is hold on a low level.
    const indexOfRestrictedDot = restrictedDots.indexOf(dot);
    indexOfRestrictedDot > -1 && restrictedDots.splice(indexOfRestrictedDot, 1);

    // when a dot is fully occupied, it lives just in the allDots, from other dot holders is removed.
    if (dot.totalDegree === 360) {
        openDots.splice(openDots.indexOf(dot), 1);
        dot.borderPermission % 2 && inviewOpenDots.splice(inviewOpenDots.indexOf(dot), 1);

        dot.nextPossTiles = { ccw: [], cw: [] };
        return;
    }

    // the vertex rule decides, that a dot would be a restricted dot too or just an open dot
    const possTilesByRule = vertexRuleReferee(dot);
    (possTilesByRule.cw.length === 1 || possTilesByRule.ccw.length === 1) &&
        restrictedDots.push(dot);

    dot.nextPossTiles = possTilesByRule;
    return;
};

// we loop through each point of the new tile and set a dot to that point (add the dot to the tile dots property - an existing dot or a new one), 
// add the tile to each dot and organize the dots with the new data (reorganize it in the dots holders, gets the new nextPossibleTiles values)
// decide that the tile should be rendered or not and watch for a gap (gap watchdog)
// return that the tile can be placed succesfully or not (when not, must be removed - gap happened) and that it reaches in the viewfiled of not (renderable)
export const setDots = function (newTile, newTileTouchPoint, attacheDirection) {
    const directionShifter = attacheDirectionCoordinator(attacheDirection); // closure => arguments(tile,point,dot)
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

        // look that the tile should be rendered or not. In the varaible rendered we save the "probably outcome" for the tile based on the border permissions of the dots, that it is attached to. (state 1 or -1 mean render, 0/-2 mean not render)
        // When true or false (1/0) is anytime set, then the destiny of the tile is set (can't be changed anymore). Just by the weak true or weak false must we look closer.
        // renderable starts with -1, when is switched to -2, then it stays so and just a 0 or 1 can it switch over (shortly, it can be switched from -1 to -2, ftom -2 to 0/1 but not the other way) (see documentation)
        if (renderable < 0)
            renderable = !(renderable % 2 || dot.borderPermission > -1) ? renderable : dot.borderPermission;
        // todo - place the original one as comment

        // when a tile is placed to the pattern, and there is a continuous edge (no gap) then the tile have always 2 points attached to a dot which have occupation more than 1 (not a newly created dot),
        // and not a fully occupied dot. There are always just 2 of them! When a gap happens, then there would be a third one and then the watchdog signals.
        dot.occupy.length > 1 && dot.totalDegree < 360 && gapWatchdog++;
        if (gapWatchdog > 2) return tileRenderSetup;

        // get the next point
        point = PenroseTile.getNeigPointN(point);
    }

    tileRenderSetup.renderable = Boolean(renderable);
    tileRenderSetup.succeed = true;
    return tileRenderSetup;
};

// removes the given dot from each dot holders, where the dot is present
const removeDot = function (dot) {
    const indexOfRestrictedDot = restrictedDots.indexOf(dot);

    delete allDots[dot.id];
    openDots.splice(openDots.indexOf(dot), 1);
    dot.borderPermission % 2 && inviewOpenDots.splice(inviewOpenDots.indexOf(dot), 1);
    indexOfRestrictedDot > -1 && restrictedDots.splice(indexOfRestrictedDot, 1);
};

// when a tile gets removed, the corresponding dots must be redefined i.e. pushed back to some dot holders or even remove it when needed,
// remove the tile from occupation property, then reorganize the dot.
export const redefineDot = function (dotToAudit, tile) {
    // a new Dot must be removed
    if (dotToAudit.occupy.length === 1) {
        removeDot(dotToAudit);
        return;
    }

    // fully occupied dots comes back. When a tile is removed from these dots, then a free space arises, and they must come back to life ;)
    if (dotToAudit.totalDegree === 360) {
        openDots.push(dotToAudit);
        dotToAudit.borderPermission % 2 && inviewOpenDots.push(dotToAudit);
    }

    // remove tile (the totalDegree is reset to right value too), reorganize dot
    dotToAudit.removeTile(tile);
    organizeDot(dotToAudit);
};

// clear all dot holders. Ready for the new pattern...
export const clear = function () {
    for (let dotId in allDots) delete allDots[dotId];

    openDots.splice(0);
    restrictedDots.splice(0);
    inviewOpenDots.splice(0);
};