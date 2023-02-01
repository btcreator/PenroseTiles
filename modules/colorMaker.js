/** This module helps create the needed colors
 * generate random colors - todo
 * gradient coloring - todo
 * rotated gradient coloring - todo
 * ...and some others and combination of these...
 */

import { randomRange } from './helpers.js';

let colors; // {tileColor: {kite: '#56DF8C', dart: '#FF12A3'}, decorColor: {amman: '#...', arcs: {large: '#...', small: '#...'}}

export const setPalette = function (colorPalette) {
    colors = colorPalette;
};

export const getTileColor = function (tileName) {
    return colors.tileColor[tileName];
};

export const getDecorColor = function (decor) {
    return colors.decorColor[decor];
};

// Generates a random color
const randomColor = function (rgbRange) {
    const tint1 = randomRange(rgbRange.red.max, rgbRange.red.min);
    const tint2 = randomRange(rgbRange.green.max, rgbRange.green.min);
    const tint3 = randomRange(rgbRange.blue.max, rgbRange.blue.min);
    return `rgb(${tint1}, ${tint2}, ${tint3})`;
};
/*
//rotated gradient coloring
const gradient = function () {
    const maxGradWidth = width - 100;
    const maxGradHeight = height - 100;
    const colorSpread = 80;
    const maxcolorAdd = 255 - colorSpread;
    const diff = 15;

    let minS = (Math.abs(tile.coord.A[0]) / maxGradWidth) * colorSpread; // 0-80 +
    minS = minS > colorSpread ? colorSpread : minS; // 0 - 80
    let maxS = (1 - Math.abs(tile.coord.A[0]) / maxGradWidth) * maxGradHeight; // maxGradHeight - (-)
    maxS = maxS < 1 ? 1 : maxS; // maxGradHeight - 1

    let spreadVertical = colorSpread - minS; // 80 - 0
    spreadVertical = spreadVertical < 1 ? 1 : spreadVertical; // 80 - 1
    let grad = (Math.abs(tile.coord.A[1]) / maxS) * spreadVertical; // 1.col: 0 - 80 , mid col: 0 - 40, last col: 0 - 1
    grad += minS;

    const tint = randomRange(grad + maxcolorAdd, grad + maxcolorAdd - diff);
    return `rgb(${tint}, ${tint}, ${tint})`;
};*/

const gradient = function (width, height, colorRange, colorSpread, coord) {
    const minColorNum = 255 - colorRange;
    const x = coord.A[0];
    const y = coord.A[1];

    // the ratio btw. the x and the width of the gradient
    const ratioOfX = x / width < 1 ? x / width : 1;
    // the ratio between value x+y (from origo throuhg x, then down y till the point) and the same line through x, down y till the border of the gradient line
    const ratio = (x + y) / (x + (1 - ratioOfX) * height);
    //continue
};
