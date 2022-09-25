import * as dotManager from './managers/dotManager.js';
import * as tileManager from './managers/tilemanager.js';
import { randomRange } from './helpers.js';

const visibleTiles = [];
let generatedTiles = 0;

export const init = function (penroseSettings) {
    const visibleArea = [penroseSettings.width, penroseSettings.height];
    const firstTileName = Math.round(Math.random()) ? 'kite' : 'dart';
    const initX = randomRange(visibleArea[0] - 2) + 1;
    const initY = randomRange(visibleArea[1] - 2) + 1;
    const rotation = penroseSettings.rotation;
    const scale = penroseSettings.density;
    const decoration = penroseSettings.decoration;

    const firstTile = tileManager.init(firstTileName, initX, initY, rotation, scale, decoration);
    dotManager.init(firstTile, visibleArea, scale);
    visibleTiles.push(firstTile);

    mainLoop();
};

export const getVisibleTiles = function () {
    return visibleTiles;
};

// Happens from 20000 tiles ca. 10 times
const removeElement = function (tile) {
    tileManager.discardTile(tile);

    for (let dotToAudit of Object.values(tile.dots)) {
        if (!dotToAudit) continue;
        dotManager.redefineDot(dotToAudit, tile);
    }
};

// This function gets an object, a blueprint of new Tile. Based on that, creates a new Tile, loaded with all necessary data like coordinates, Point occupation with dots.
// (i.e. return a "redy to render" tile)
const createElement = function ({
    newTileName,
    newTileTouchPoint,
    targetTile,
    targetTouchPoint,
    attacheDirection,
}) {
    const newTile = tileManager.setTile(
        newTileName,
        newTileTouchPoint,
        targetTile,
        targetTouchPoint,
        attacheDirection
    );
    const setDotsResult = dotManager.setDots(newTile, newTileTouchPoint, attacheDirection);

    !setDotsResult.succeed && removeElement(newTile);

    return setDotsResult.succeed && setDotsResult.renderable && newTile;
};

const mainLoop = function () {
    while (dotManager.getInviewOpenDots().length) {
        const nextTileBlueprint = dotManager.getNextTileBlueprint();
        const nextVisibleTile = createElement(nextTileBlueprint);
        nextVisibleTile && visibleTiles.push(nextVisibleTile);
        generatedTiles++;
    }
};

export const cleanUp = function () {
    tileManager.clear();
    dotManager.clear();
    visibleTiles.splice(0);
};
