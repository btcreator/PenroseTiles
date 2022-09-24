import * as colors from '../colorMaker.js';

let svgMarkup;
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
    return svgMarkup;
};

const generateSVGpolygon = function (tile) {
    return `<polygon points="${Object.values(tile.coord).reduce(
        (acc, val) => acc + ' ' + val
    )}" style="fill:${colors.getColor(tile)};" />
<path fill="none" stroke="white"
d="M${Object.values(tile.ammann).reduce((acc, val) => acc + ' L' + val)}" />`;
};

const renderSVG = function (visibleTiles) {
    for (let tile of visibleTiles) svgMarkup += generateSVGpolygon(tile);
    svgMarkup += '</svg>';
    svgContainer.insertAdjacentHTML('afterbegin', svgMarkup);
};

const clearView = function () {
    svgContainer.innerText = '';
    svgMarkup = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0"
    width="${width}" height="${height}">`;
};

// viewBox="0 0 ${this.width} ${this.height}
// width="${this.width}" height="${this.height}
