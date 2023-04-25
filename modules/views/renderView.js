/** This module is for:
 * - create a HTML markup from the generated tiles
 * - optionally add a decoration to it
 * - render on the screen
 */
import * as colors from '../colorMaker.js';

let kiteSvgGroup, dartSvgGroup;
let ammanSvgGroup, largeSvgGroup, smallSvgGroup;
let width, height, scale, decoration;
let isSpecialColoring;
const specArc = {
    large: {
        flags: null,
        radiusScale: null,
    },
    small: {
        flags: null,
        radiusScale: null,
    },
};
const svgContainer = document.querySelector('.penrose-pattern-container');

// Save the needed settings, clear the viewport (there can be a previous generated pattern), invoke the rendering process
export const init = function (penroseSettings, visibleTiles) {
    // set colors and special colors settings
    const palette = {
        tileColor: { kite: penroseSettings.colorKite, dart: penroseSettings.colorDart },
        decorColor: {
            amman: penroseSettings.colorAmman,
            arcs: {
                large: penroseSettings.colorLargeArc,
                small: penroseSettings.colorSmallArc,
            },
        },
        specialColor: { threshOne: penroseSettings.colorThresholdOne, threshTwo: penroseSettings.colorThresholdTwo },
    };
    const specColorSettings = {
        random: Boolean(penroseSettings.random),
        gradient: Boolean(penroseSettings.gradient),
        gradDistance: penroseSettings.gradDistance,
        gradRotation: penroseSettings.gradRotation,
        gradSpread: penroseSettings.gradSpread,
    };
    colors.setPalette(palette, specColorSettings);

    // set special arc settings
    // sweep Falg default is 1
    specArc.large.flags = [Number(Boolean(penroseSettings.largeLArcFlag)), Number(!penroseSettings.largeSweepFlag)];
    specArc.small.flags = [Number(Boolean(penroseSettings.smallLArcFlag)), Number(!penroseSettings.smallSweepFlag)];
    specArc.large.radiusScale = penroseSettings.largeRadiusScale;
    specArc.small.radiusScale = penroseSettings.smallRadiusScale;

    // set general rendering settings
    ({ width, height, scale, decoration } = penroseSettings);
    isSpecialColoring = specColorSettings.random || specColorSettings.gradient;

    clearView();
    renderSVG(visibleTiles);
};

export const getMarkup = function () {
    return svgContainer.innerHTML;
};

const insertTile = function (name, markup) {
    name === 'kite'
        ? kiteSvgGroup.insertAdjacentHTML('afterbegin', markup)
        : dartSvgGroup.insertAdjacentHTML('afterbegin', markup);
};

// For each tile is a polygon generated
const generateSVGpolygon = function (tile) {
    const markup = `<polygon points="${Object.values(tile.coord).reduce((acc, val) => acc + ' ' + val)}" />`;

    insertTile(tile.name, markup);
};

const generateSVGcoloredPolygon = function (tile) {
    const markup = `<polygon points="${Object.values(tile.coord).reduce(
        (acc, val) => acc + ' ' + val
    )}" fill="${colors.getSpecialColor(tile.coord)}" />`;

    insertTile(tile.name, markup);
};

// Decorations are added to the end of the svg, because of the darts amman line.
// It reaches to the "outside" of the tile at one point and because of this, it must be on top of the tiles i.e. at the end.
const generateSVGdecorAmman = function (tile) {
    ammanSvgGroup.insertAdjacentHTML(
        'afterbegin',
        `<path d="M${Object.values(tile.decoord).reduce((acc, val) => acc + ' L' + val)}" />`
    );
};

const generateSVGdecorArcs = function (tile) {
    const multiplLarge = specArc.large.radiusScale * scale;
    const multiplSmall = specArc.small.radiusScale * scale;

    const largeA = `<path d="M ${tile.decoord.A1[0]} ${tile.decoord.A1[1]} 
    A ${tile.arcRadiusL * multiplLarge} ${tile.arcRadiusL * multiplLarge} 0 ${specArc.large.flags.join(' ')} 
    ${tile.decoord.A2[0]} ${tile.decoord.A2[1]}" />`;

    const smallA = `<path d="M ${tile.decoord.A3[0]} ${tile.decoord.A3[1]} 
    A ${tile.arcRadiusS * multiplSmall} ${tile.arcRadiusS * multiplSmall} 0 ${
        Number(tile.name === 'dart') ^ specArc.small.flags[0]
    } ${specArc.small.flags[1]} 
    ${tile.decoord.A4[0]} ${tile.decoord.A4[1]}" />`;

    largeSvgGroup.insertAdjacentHTML('afterbegin', largeA);
    smallSvgGroup.insertAdjacentHTML('afterbegin', smallA);
};

const renderSVG = function (visibleTiles) {
    const tileGeneratorFunc = isSpecialColoring ? generateSVGcoloredPolygon : generateSVGpolygon;

    if (decoration === 'amman') {
        visibleTiles.forEach(tile => {
            tileGeneratorFunc(tile);
            generateSVGdecorAmman(tile);
        });
    } else if (decoration === 'arcs') {
        visibleTiles.forEach(tile => {
            tileGeneratorFunc(tile);
            generateSVGdecorArcs(tile);
        });
    } else visibleTiles.forEach(tile => tileGeneratorFunc(tile));
};

const clearView = function () {
    svgContainer.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${width}" height="${height}">
        <g id="tiles">
            <g id="kite" fill="${isSpecialColoring ? '' : colors.getTileColor('kite')}"></g>
            <g id="dart" fill="${isSpecialColoring ? '' : colors.getTileColor('dart')}"></g>
        </g>
        <g id="decor" stroke-width="${scale * 0.01 + 0.6}">
            <g id="amman" fill="none" stroke="${colors.getDecorColor('amman')}"></g>
            <g id="arcs" fill="none">
                <g id="large" stroke="${colors.getDecorColor('arcs').large}"></g>
                <g id="small" stroke="${colors.getDecorColor('arcs').small}"></g>
            </g>
        </g>
    </svg>`;

    kiteSvgGroup = svgContainer.querySelector('#kite');
    dartSvgGroup = svgContainer.querySelector('#dart');
    ammanSvgGroup = svgContainer.querySelector('#amman');
    largeSvgGroup = svgContainer.querySelector('#large');
    smallSvgGroup = svgContainer.querySelector('#small');
};
