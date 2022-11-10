/** This module is for:
 * - create a new tile
 * - rotate and scale it
 * - calculate the new position on the coordinate system and then
 * - move the tile on that position
 */
import PenroseTile from '../tiles/penroseTile.js';
import Kite from '../tiles/kite.js';
import Dart from '../tiles/dart.js';

let scaleBase;
let tileDecor;

export const init = function (firstTileName, x, y, rotation, scale, decoration) {
    scaleBase = scale;
    tileDecor = decoration;
    return createRawTile(firstTileName, rotation).moveToPos(x, y);
};

// each point connects two sides together (point A -> sides d & a). This returns the corresponding side, based on the attaching direction
const convPointToSide = function (touchPoint, dir) {
    return dir ? PenroseTile.getNeigPointN(touchPoint, -1).toLowerCase() : touchPoint.toLowerCase();
};

// get the initial angle of the required side
const getAngle = function (tileName, side) {
    return tileName === 'kite' ? Kite.refAngles[side] : Dart.refAngles[side];
};

// returns how much we should rotate on the new tile to get the target tile contact side and the new tile contact side together / in contact when the tile is placed on his right place
// how it is calculated: bring the two tile sides to the same angle level (angleTargetTile - angleNewTile => the new Tile side would now parallel with the target side - just on initial state!).
// Turn around the tile (+180). Now the tiles dont cover each other. At the end just rotate to the actual target position (+targetTile.rotation)
const getRotation = function (newTileName, newTileContactSide, targetTile, targetContactSide) {
    const angleTargetTile = getAngle(targetTile.name, targetContactSide);
    const angleNewTile = getAngle(newTileName, newTileContactSide);
    return (angleTargetTile - angleNewTile + 180 + targetTile.rotation) % 360;
};

const createRawTile = function (tileName, rotation) {
    const newTile =
        tileName === 'kite' ? new Kite(rotation, tileDecor) : new Dart(rotation, tileDecor);
    newTile.scaleTile(scaleBase);
    return newTile;
};

// calculate the finally x,y position of a new Tile. The point "A" is the ref point.
const calcXYcoords = function (newTileCoord, newTileTouchPoint, targetTileCoord, targetTouchPoint) {
    return newTileCoord[newTileTouchPoint].map((touchPointCoord, i) => targetTileCoord[targetTouchPoint][i] - touchPointCoord);
    // the same as:
    /*
    const newTilePosX = targetTileCoord[targetTouchPoint][0] - newTileCoord[newTileTouchPoint][0];
    const newTilePosY = targetTileCoord[targetTouchPoint][1] - newTileCoord[newTileTouchPoint][1];
    return [newTilePosX, newTilePosY]; */
};

//  create the next deployable tile, which is rotated and moved to required position.
export const setTile = function (
    newTileName,
    newTileTouchPoint,
    targetTile,
    targetTouchPoint,
    attacheDirection
) {
    const targetContactSide = convPointToSide(targetTouchPoint, attacheDirection);

    const newTileContactSide = convPointToSide(newTileTouchPoint, !attacheDirection);

    const newTileRotation = getRotation(
        newTileName,
        newTileContactSide,
        targetTile,
        targetContactSide
    );
    const newPenroseTile = createRawTile(newTileName, newTileRotation);

    const newTilePos = calcXYcoords(
        newPenroseTile.coord,
        newTileTouchPoint,
        targetTile.coord,
        targetTouchPoint
    );
    return newPenroseTile.moveToPos(...newTilePos);
};