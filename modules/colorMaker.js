/** This module helps create the needed colors
 * generate random colors - todo
 * gradient coloring - todo
 * rotated gradient coloring - todo
 * ...and some others and combination of these...
 */

import { randomRange } from './helpers.js';

const colors = {}; // {tileColor: {kite: '#56DF8C', dart: '#FF12A3'}, decorColor: {amman: '#...', arcs: {large: '#...', small: '#...'}, specialColor: {from: '#...', to: '#...'}}
let specColorFunc;

// The initial function which sets the initital settings and
export const setPalette = function (colorPalette, specSettings) {
    const fromHSL = hexToHSLArray(colorPalette.specialColor.from);
    const toHSL = hexToHSLArray(colorPalette.specialColor.to);

    const hslOffsets = hslOffsetMinData(fromHSL, toHSL, "offset");
    const minHSLvalues = hslOffsetMinData(fromHSL, toHSL, "min");

    specColorFunc = selectSpecFunc(hslOffsets, minHSLvalues, specSettings);

    Object.assign(colors, colorPalette);
};

export const getTileColor = function (tileName) {
    return colors.tileColor[tileName];
};

export const getDecorColor = function (decor) {
    return colors.decorColor[decor];
};

export const getSpecialColor = function (coord) {
   const hsl = specColorFunc(coord);
   return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

// Generates a random color
const randomColorData = function (hslOffsets, minHSLvalues) {
    return hslOffsets.map((offset, i) => randomRange(offset) + minHSLvalues[i]);
};


// Generate a rotated linear gradient coloring
const gradientColor = function(hslOffsets, minHSLvalues, distance, gradRotation, colorSpread, random, coord) {
    const a = coord.A[0];
    const b = coord.A[1];
    const c = Math.sqrt(a**2 + b**2);

    // ratio between the distance and the line from point(coord) perpendicular to the gradients beginning "border"
    // ratio is between 0 and 1
    let ratio = Math.cos(gradRotation * Math.PI / 180 - Math.asin(b / c)) * c / distance;
    ratio = ratio > 1 ? 1 : ratio;
  
    return random ?
    hslOffsets.map((offset, i) => {
        const channelMax = minHSLvalues[i] + offset;
        const channelMin = minHSLvalues[i] + ratio * offset;
        return randomRange(channelMax, channelMin);
    }) :
    hslOffsets.map((offset, i) => {
        const channelMax = minHSLvalues[i] + ratio * offset;
        return randomRange(channelMax, channelMax - colorSpread);
    });
}

////////////////////////
// Functions for set the inital settings - evoked just on the beginning (for the faster data access and so faster generating of the colors)

// Convert hex color to HSL
const hexToHSLArray = function (colorHex) {
    let r = parseInt(colorHex[1] + colorHex[2], 16) / 255;
    let g = parseInt(colorHex[3] + colorHex[4], 16) / 255;
    let b = parseInt(colorHex[5] + colorHex[6], 16) / 255;


    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    
    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;
    
    h = Math.round(h * 60);
    
    if (h < 0)
        h += 360;
    
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    return [h,s,l];
}

// Return the HSL channels offsets (the value between min and max) and the minimum values of each channel
const hslOffsetMinData = function(fromHSL, toHSL, offsetOrMin) {
    return offsetOrMin === "min" ?
        fromHSL.map((value, i) => Math.min(toHSL[i],value)) :
        fromHSL.map((value, i) => Math.abs(toHSL[i] - value));
}

// Set the needed function for generating the colors for faster call (can be rid of if statements for each call)
const selectSpecFunc = function(hslOffsets, minHSLvalues, specSettings) {
    //{ random: boolean, gradient: boolean, gradDistance: number, gradRotation: number(degree), gradSpread: number }
    const { random, gradient, gradDistance, gradRotation, gradSpread } = specSettings;
    return random && !gradient ? 
        randomColorData.bind(null, hslOffsets, minHSLvalues) : 
        gradientColor.bind(null, hslOffsets, minHSLvalues, gradDistance, gradRotation, gradSpread, random);
}

// continue

// on small screen the settings are overflowing the viewport
// gradient info for users