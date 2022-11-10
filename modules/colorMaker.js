/** This module helps create the needed colors
 * generate random colors - todo
 * gradient coloring - todo
 * rotated gradient coloring - todo
 * ...and some others and combination of these...
 */

import { randomRange } from './helpers.js';

let colors; // {kiteColor: '#56DF8C', dartColor: '#FF12A3', decorColor: {amman: '#...', arcs: {large: '#...', small: '#...'}}

export const setPalette = function (colorPalette) {
    colors = colorPalette;
};

export const getTileColor = function (tile) {
    return tile.name === 'kite' ? colors.kiteColor : colors.dartColor;
};

export const getDecorColor = function (decor) {
    return colors.decorColor[decor];
};

// generates a random color
const randomColor = function (rgbRange) {
    const tint1 = randomRange(rgbRange.red.max, rgbRange.red.min);
    const tint2 = randomRange(rgbRange.green.max, rgbRange.green.min);
    const tint3 = randomRange(rgbRange.blue.max, rgbRange.blue.min);
    return `rgb(${tint1}, ${tint2}, ${tint3})`;
};

/*
Under construction....
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

    const tint = randomRange(grad + maxcolorAdd, grad + maxcolorAdd - diff);
    return `rgb(${tint}, ${tint}, ${tint})`;
    */
