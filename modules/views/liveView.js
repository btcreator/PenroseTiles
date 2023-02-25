/** Live View is the sample of a pattern in settings menu which is updated instantly when a user changes its settings
 * - create a wrapping elements for the svg sample image
 * - set the initial state
 * - updates the image
 */
import { toggleSwitchOrHide } from '../helpers.js';
import { svgImg } from './live_view_elements/settingsSVG.js';
import { stylesheetText } from './live_view_elements/customCss.js';

const liveContainer = document.createElement('div');
const liveImageDecorations = [];

// Create a shadow root, set a custom css and elements for the live view svg. Then manipulate/update just the css variables.
const initElements = function () {
    const root = liveContainer.attachShadow({ mode: 'open' });
    const liveStyle = document.createElement('style');
    const liveImage = document.createElement('div');
    const markup = `
        <div id='live-sample' class='image-wrapper'>${svgImg}</div>
        <p>Live sample</p>
        <div id='bird-view' class='image-wrapper'>${svgImg}</div>
        <p>Birdview</p>`;

    liveImage.setAttribute('id', 'live-image');
    liveStyle.innerHTML = stylesheetText;
    liveImage.innerHTML = markup;

    root.append(liveStyle, liveImage);

    // save decoration nodes for faster access when update
    liveImageDecorations.push(...liveImage.querySelectorAll('.decor-type'));

    return liveImage;
};

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

// Updates the svg poperties with the actual values or disable live-sample
export const updateLiveView = function () {
    const liveImage = liveContainer.shadowRoot.querySelector('#live-image');
    const liveSample = liveContainer.shadowRoot.querySelector('#live-sample');
    return function (prop, value) {
        switch (prop) {
            case 'disabled':
                liveSample.classList.toggle('disabled', value);
                break;
            case 'decoration':
                liveImageDecorations.forEach(el => el.classList.toggle('hidden', el.dataset.toggle !== value));
                break;
            default:
                liveImage.style.setProperty(`--${prop}`, value);
        }
    };
};
