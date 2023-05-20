/** This module helps create the needed colors
 * generate random colors - todo
 * gradient coloring - todo
 * rotated gradient coloring - todo
 * ...and some others and combination of these...
 */

import { randomRange } from './helpers.js';

const colors = {}; // {tileColor: {kite: '#56DF8C', dart: '#FF12A3'}, decorColor: {amman: '#...', arcs: {large: '#...', small: '#...'}, specialColor: {threshOne: '#...', threshTwo: '#...'}}
let specColorFunc;

// The initial function which sets the initital settings and
export const setPalette = function (colorPalette, specSettings) {
    const fromColor = hexToRGBArray(colorPalette.specialColor.threshOne);
    const toColor = hexToRGBArray(colorPalette.specialColor.threshTwo);
    const offsets = toColor.map((color, i) => color - fromColor[i]);

    specColorFunc = chargeSpecFunc(offsets, fromColor, specSettings);

    Object.assign(colors, colorPalette);
};

export const getTileColor = function (tileName) {
    return colors.tileColor[tileName];
};

export const getDecorColor = function (decor) {
    return colors.decorColor[decor];
};

export const getSpecialColor = function (coord) {
    const rgb = specColorFunc(coord);
    return `rgb(${rgb.join()})`;
};

// Generates a random color
const randomColorData = function (offsets, fromColor) {
    const randomRatio = Math.random();
    return offsets.map((offset, i) => Math.round(offset * randomRatio + fromColor[i]));
};

// Generate a rotated linear gradient coloring
const gradientColor = function (offsets, fromColor, distance, gradRotation, colorSpread, random, coord) {
    const a = coord.A[0];
    const b = coord.A[1];
    const c = Math.sqrt(a ** 2 + b ** 2);

    // ratio between the distance and the line from point(coord) perpendicular to the gradients beginning "border"
    const ratio = (Math.cos((gradRotation * Math.PI) / 180 - Math.asin(b / c)) * c) / distance;
    let ratioSpread = random ? Math.random() : randomRange(colorSpread) / 100;
    ratioSpread += ratio;
    ratioSpread = ratioSpread > 1 ? 1 : ratioSpread;

    return offsets.map((offset, i) => Math.round(fromColor[i] + offset * ratioSpread));
};

////////////////////////
// Functions for set the inital settings - evoked just on the beginning (for the faster data access and so faster generating of the colors)

// Convert hex color to HSL
const hexToRGBArray = function (colorHex) {
    let r = parseInt(colorHex[1] + colorHex[2], 16);
    let g = parseInt(colorHex[3] + colorHex[4], 16);
    let b = parseInt(colorHex[5] + colorHex[6], 16);

    return [r, g, b];
};

// Set the needed function for generating the colors for faster call (can be rid of if statements for each call)
const chargeSpecFunc = function (offsets, fromColor, specSettings) {
    //{ random: boolean, gradient: boolean, gradDistance: number, gradRotation: number(degree), gradSpread: number }
    const { random, gradient, gradDistance, gradRotation, gradSpread } = specSettings;
    return random && !gradient
        ? randomColorData.bind(null, offsets, fromColor)
        : gradientColor.bind(null, offsets, fromColor, gradDistance, gradRotation, gradSpread, random);
};
