/** This module is for:
 * - create a HTML markup from the generated tiles
 * - optionally add a decoration to it
 * - render on the screen
 */
import * as colors from '../colorMaker.js';

let kiteSvgGroup, dartSvgGroup;
let ammanSvgGroup, largeSvgGroup, smallSvgGroup;
let width, height;
let scale, decor;
const svgContainer = document.querySelector('.penrose-pattern-container');

// Save the needed settings, clear the viewport (there can be a previous generated pattern), invoke the rendering process
export const init = function (penroseSettings, visibleTiles) {
    width = penroseSettings.width;
    height = penroseSettings.height;
    scale = penroseSettings.density;
    decor = penroseSettings.decoration;
    colors.setPalette({
        tileColor: penroseSettings.tileColor,
        decorColor: penroseSettings.decorationColor,
    });
    clearView();
    renderSVG(visibleTiles);
};

export const getMarkup = function () {
    return svgContainer.innerHTML;
};

// For each tile is a polygon generated
const generateSVGpolygon = function (tile) {
    const mark = `<polygon points="${Object.values(tile.coord).reduce((acc, val) => acc + ' ' + val)}" />`;

    tile.name === 'kite'
        ? kiteSvgGroup.insertAdjacentHTML('afterbegin', mark)
        : dartSvgGroup.insertAdjacentHTML('afterbegin', mark);
};

// Decorations are added to the end of the svg, because of the darts amman line.
// It reaches to the "outside" of the tile at one point and because of this, it must be on top of the tiles i.e. at the end.
const generateSVGdecorAmman = function (tile) {
    ammanSvgGroup.insertAdjacentHTML('afterbegin',
        `<path d="M${Object.values(tile.decoord).reduce((acc, val) => acc + ' L' + val)}" />`
    );
};

const generateSVGdecorArcs = function (tile) {
    const largeA = `<path d="M ${tile.decoord.A1[0]} ${tile.decoord.A1[1]} A ${
        tile.arcRadiusL * scale
    } ${tile.arcRadiusL * scale} 0 0 1 ${tile.decoord.A2[0]} ${
        tile.decoord.A2[1]
    }" />`;
    const smallA = `<path d="M ${tile.decoord.A3[0]} ${tile.decoord.A3[1]} A ${
        tile.arcRadiusS * scale
    } ${tile.arcRadiusS * scale} 0 ${tile.name === 'kite' ? '0' : '1'} 1 ${
        tile.decoord.A4[0]
    } ${tile.decoord.A4[1]}" />`;

    largeSvgGroup.insertAdjacentHTML('afterbegin', largeA);
    smallSvgGroup.insertAdjacentHTML('afterbegin', smallA);
};

const renderSVG = function (visibleTiles) {
    if (decor === 'amman') {
        visibleTiles.forEach(tile => {
            generateSVGpolygon(tile);
            generateSVGdecorAmman(tile);
        });
    } else if (decor === 'arcs') {
        visibleTiles.forEach(tile => {
           generateSVGpolygon(tile);
           generateSVGdecorArcs(tile);
        });
    } else
        visibleTiles.forEach(tile => generateSVGpolygon(tile));
};

const clearView = function () {
    svgContainer.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${width}" height="${height}">
        <g id="tiles">
            <g id="kite" fill="${colors.getTileColor('kite')}"></g>
            <g id="dart" fill="${colors.getTileColor('dart')}"></g>
        </g>
        <g id="decor">
            <g id="amman" fill="none" stroke="${colors.getDecorColor('amman')}" stroke-width="${scale * 0.01 + 0.5}"></g>
            <g id="arcs" fill="none" stroke-width="1">
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
