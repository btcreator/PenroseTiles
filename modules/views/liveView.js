/** Live View is the sample of a pattern in settings menu which is updated instantly when a user changes its settings
 * - create a wrapping elements for the svg sample image
 * - set the initial state
 * - updates the image
 */
import { svgImg } from './live_view_elements/settingsSVG.js'; // todo functioning with svg import too?
import { stylesheetText } from './live_view_elements/customCss.js';

const liveContainer = document.createElement('div');
const decorations = [];

// Create a shadow root, set a custom css and elements for the live view svg. Then manipulate/update just the css variables.
const initElements = function () {
    const root = liveContainer.attachShadow({ mode: 'open' });
    const liveImage = document.createElement('div');
    const liveStyle = document.createElement('style');

    liveImage.setAttribute('id', 'live-image');
    liveImage.innerHTML = svgImg;
    liveStyle.innerHTML = stylesheetText;

    // save decoration nodes for faster access when update
    decorations.push(...liveImage.querySelector('#decor').children);

    root.append(liveStyle, liveImage);

    return liveImage;
};

// Create the live View element, then set the initial state (colors, decoration....)
export const setLiveView = function (liveViewSettings) {
    const liveImage = initElements();

    // set colors
    liveImage.style.setProperty('--kite', liveViewSettings.tileColor.kite);
    liveImage.style.setProperty('--dart', liveViewSettings.tileColor.dart);
    liveImage.style.setProperty('--amman', liveViewSettings.decorationColor.amman);
    liveImage.style.setProperty('--large', liveViewSettings.decorationColor.arcs.large);
    liveImage.style.setProperty('--small', liveViewSettings.decorationColor.arcs.small);
    // set density and rotation
    liveImage.style.setProperty('--density', liveViewSettings.density);
    liveImage.style.setProperty('--rotation', `${liveViewSettings.rotation}deg`);
    // set decoration
    decorations.forEach(el => el.classList.toggle('hidden', liveViewSettings.decoration !== el.id));

    return liveContainer;
};

// Updates the svg poperties with the actual values
export const updateLiveView = function (prop, value) {
    prop === 'decoration'
        ? decorations.forEach(el => el.classList.toggle('hidden', value !== el.id))
        : liveContainer.shadowRoot
              .querySelector('#live-image')
              .style.setProperty(`--${prop}`, value);
    // liveContainer.shadowRoot.lastElementChild.style.setProperty(`--${prop}`, value);
};
