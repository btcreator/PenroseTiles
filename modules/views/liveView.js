/** Live View is the sample of a pattern in settings menu which is updated instantly when a user changes its settings
 * - create a wrapping elements for the svg sample image
 * - set the initial state
 * - updates the image
 */

import { svgSettings } from './live_view_elements/settingsSVG.js';
import { stylesheetText } from './live_view_elements/customCss.js';

const liveContainer = document.createElement('div');
const liveImageDecorations = [];

// Create the live View element, then set the initial state (colors, decoration....)
export const setLiveView = function (liveViewSettings) {
    const liveImage = initElements();

    // set colors
    liveImage.style.setProperty('--kite', liveViewSettings.colorKite);
    liveImage.style.setProperty('--dart', liveViewSettings.colorDart);
    liveImage.style.setProperty('--amman', liveViewSettings.colorAmman);
    liveImage.style.setProperty('--large', liveViewSettings.colorLargeArc);
    liveImage.style.setProperty('--small', liveViewSettings.colorSmallArc);
    // set scale (density) and rotation
    liveImage.style.setProperty('--scale', liveViewSettings.scale);
    liveImage.style.setProperty('--rotation', `${liveViewSettings.rotation}deg`);
    // set decoration
    liveImageDecorations.forEach(el =>
        el.classList.toggle('hidden', el.dataset.toggle !== liveViewSettings.decoration)
    );

    return liveContainer;
};

// Create a shadow root, set a custom css and elements for the live view svg. Then manipulate/update just the css variables, classes and elements
// Set templates for special Arc flag updates.
const initElements = function () {
    const root = liveContainer.attachShadow({ mode: 'open' });
    const liveStyle = document.createElement('style');
    const liveImage = document.createElement('div');
    // fill the templates with initial/default value
    const filledLargeArcTemp = replaceArcData(svgSettings.svgArcTemp.large);
    const filledSmallArcTemp = replaceArcData(svgSettings.svgArcTemp.small);
    const filledSvgTemp = svgSettings.svgImgTemp
        .replace('{ARC_LARGE_PLACEHOLDER}', filledLargeArcTemp)
        .replace('{ARC_SMALL_PLACEHOLDER}', filledSmallArcTemp);
    const markup = `
        <div id='live-sample' class='image-wrapper'>${filledSvgTemp}</div>
        <p>Live sample</p>
        <div id='bird-view' class='image-wrapper'>${filledSvgTemp}</div>
        <p>Birdview</p>`;

    liveImage.setAttribute('id', 'live-image');
    liveStyle.innerHTML = stylesheetText;
    liveImage.innerHTML = markup;
    root.append(liveStyle, liveImage);

    // save decoration nodes for faster access when update
    liveImageDecorations.push(...liveImage.querySelectorAll('.decor-type'));

    return liveImage;
};

// Replace the arc data with the new (or initial/default) settings in the passed template
const replaceArcData = function (arcTemplate, arcSettings = { radiusScale: 1, state: [0, 0] }) {
    const smallArc = `${svgSettings.arcData.s * arcSettings.radiusScale} ${
        svgSettings.arcData.s * arcSettings.radiusScale
    } 0 ${+!arcSettings.state[0]} ${+!arcSettings.state[1]}`;
    const mediumArc = `${svgSettings.arcData.m * arcSettings.radiusScale} ${
        svgSettings.arcData.m * arcSettings.radiusScale
    } 0 ${+arcSettings.state[0]} ${+!arcSettings.state[1]}`;
    const largeArc = `${svgSettings.arcData.l * arcSettings.radiusScale} ${
        svgSettings.arcData.l * arcSettings.radiusScale
    } 0 ${+arcSettings.state[0]} ${+!arcSettings.state[1]}`;
    return arcTemplate
        .replace(/{ARC_DATA_S}/g, smallArc)
        .replace(/{ARC_DATA_M}/g, mediumArc)
        .replace(/{ARC_DATA_L}/g, largeArc);
};

// Updates the svg poperties with the actual values or disable live-sample
export const updateLiveView = function () {
    const liveImage = liveContainer.shadowRoot.querySelector('#live-image');
    const liveSample = liveContainer.shadowRoot.querySelector('#live-sample');
    const birdView = liveContainer.shadowRoot.querySelector('#bird-view');
    const arcs = {
        large: liveImage.querySelectorAll('.arcs .large'),
        small: liveImage.querySelectorAll('.arcs .small'),
    };

    return function (prop, value) {
        switch (prop) {
            case 'disabled':
                liveSample.classList.toggle('disabled', value);
                birdView.classList.toggle('disabled', value);
                break;

            case 'decoration':
                liveImageDecorations.forEach(el => el.classList.toggle('hidden', el.dataset.toggle !== value));
                break;

            case 'advancedArc':
                const filledTemplate = replaceArcData(svgSettings.svgArcTemp[value.name], value.data);
                arcs[value.name].forEach(group => (group.innerHTML = filledTemplate));
                break;

            default:
                liveImage.style.setProperty(`--${prop}`, value);
        }
    };
};
