import * as colors from '../colorMaker.js';

let tilesSvgGroup;
let decorSvgGroup;
let width, height;
const svgContainer = document.querySelector('.penrose-pattern-container');

export const init = function (viewWidth, viewHeight, colorPalette, visibleTiles) {
    width = viewWidth;
    height = viewHeight;
    colors.setPalette(colorPalette);
    clearView();
    renderSVG(visibleTiles);
};

export const getMarkup = function () {
    return svgContainer.innerHTML;
};

const generateSVGpolygon = function (tile) {
    return `<polygon points="${Object.values(tile.coord).reduce(
        (acc, val) => acc + ' ' + val
    )}" style="fill:${colors.getColor(tile)};" />`;
};

const generateSVGdecoration = function (tile) {
    return `<path fill="none" stroke="lightgrey" stroke-width=".5"
    d="M${Object.values(tile.decor.coord).reduce((acc, val) => acc + ' L' + val)}" />`;
};

const renderSVG = function (visibleTiles) {
    console.log(visibleTiles[0].decor.type);
    if (visibleTiles[0].decor.type) {
        for (let tile of visibleTiles) {
            tilesSvgGroup.insertAdjacentHTML('afterbegin', generateSVGpolygon(tile));
            decorSvgGroup.insertAdjacentHTML('afterbegin', generateSVGdecoration(tile));
        }
    } else
        for (let tile of visibleTiles)
            tilesSvgGroup.insertAdjacentHTML('afterbegin', generateSVGpolygon(tile));
};

const clearView = function () {
    svgContainer.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${width}" height="${height}"><g id="tiles"></g><g id="decor"></g></svg>`;
    tilesSvgGroup = svgContainer.querySelector('#tiles');
    decorSvgGroup = svgContainer.querySelector('#decor');
};

// viewBox="0 0 ${this.width} ${this.height}
// width="${this.width}" height="${this.height}
