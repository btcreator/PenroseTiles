/** This module is for:
 * - create a HTML markup from the generated tiles
 * - optionally add a decoration to it
 * - render on the screen
 */
import * as colors from '../colorMaker.js';

let tilesSvgGroup;
let decorSvgGroup;
let width, height;
let scale;
const svgContainer = document.querySelector('.penrose-pattern-container');

// save the needed settings, clear the viewport (there can be a previous generated pattern), invoke the rendering process
export const init = function (penroseSettings, visibleTiles) {
    width = penroseSettings.width;
    height = penroseSettings.height;
    scale = penroseSettings.density;
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

// for each tile is a polygon generated
const generateSVGpolygon = function (tile) {
    return `<polygon points="${Object.values(tile.coord).reduce(
        (acc, val) => acc + ' ' + val
    )}" style="fill:${colors.getTileColor(tile.name)};" />`;
};
// decorations are added to the separate group element to the end of the svg - actually just because of the darts amman line
// it reach to the "outside" of the tile at one point and because of this, it must be on top of the tiles i.e. at the end.
const generateSVGdecorAmman = function (tile) {
    return `<path fill="none" stroke="${colors.getDecorColor(tile.decor.type)}" stroke-width="${
        scale * 0.01 + 0.5
    }"
    d="M${Object.values(tile.decor.coord).reduce((acc, val) => acc + ' L' + val)}" />`;
};

const generateSVGdecorArcs = function (tile) {
    return `<path fill="none" stroke="${
        colors.getDecorColor(tile.decor.type).large
    }" stroke-width="1"
    d="M ${tile.decor.coord.A1[0]} ${tile.decor.coord.A1[1]} A ${tile.arcRadiusL * scale} ${
        tile.arcRadiusL * scale
    } 0 0 1 ${tile.decor.coord.A2[0]} ${tile.decor.coord.A2[1]}" />
    <path fill="none" stroke="${colors.getDecorColor(tile.decor.type).small}" stroke-width="1"
    d="M ${tile.decor.coord.A3[0]} ${tile.decor.coord.A3[1]} A ${tile.arcRadiusS * scale} ${
        tile.arcRadiusS * scale
    } 0 ${tile.name === 'kite' ? '0' : '1'} 1 ${tile.decor.coord.A4[0]} ${
        tile.decor.coord.A4[1]
    }" />`;
};

const renderSVG = function (visibleTiles) {
    if (visibleTiles[0].decor.type === 'amman') {
        visibleTiles.forEach(tile => {
            tilesSvgGroup.insertAdjacentHTML('afterbegin', generateSVGpolygon(tile));
            decorSvgGroup.insertAdjacentHTML('afterbegin', generateSVGdecorAmman(tile));
        });
    } else if (visibleTiles[0].decor.type === 'arcs') {
        visibleTiles.forEach(tile => {
            tilesSvgGroup.insertAdjacentHTML('afterbegin', generateSVGpolygon(tile));
            decorSvgGroup.insertAdjacentHTML('afterbegin', generateSVGdecorArcs(tile));
        });
    } else
        visibleTiles.forEach(tile =>
            tilesSvgGroup.insertAdjacentHTML('afterbegin', generateSVGpolygon(tile))
        );
};

const clearView = function () {
    svgContainer.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${width}" height="${height}"><g id="tiles"></g><g id="decor"></g></svg>`;
    tilesSvgGroup = svgContainer.querySelector('#tiles');
    decorSvgGroup = svgContainer.querySelector('#decor');
};
