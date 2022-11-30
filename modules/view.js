/** This Modul connects all views together
 * - initialize the main menu an the live view (liveView)
 * - pass the generator to interaction, which.. (interactionView)
 *   - grabs the settings inputs from user and invoke it
 * - render the received tiles from model on the screen (renderView)
 */
import * as render from './views/renderView.js';
import * as interact from './views/interactionView.js';
import * as live from './views/liveView.js';

// Init and create live Image, and the user menu
export const initUserMenu = function (penrosePatternGenerator) {
    interact.toggleLoader('Loading Interface...');

    // create live view with initial settings
    const liveViewSettings = interact.getInitSettings();
    const liveImgContainer = live.setLiveView(liveViewSettings);

    interact.interactionHandler(penrosePatternGenerator, liveImgContainer, live.updateLiveView);

    interact.toggleLoader();
};

// The rendering process to the screen
export const renderPenrosePattern = function (penroseSettings, visibleTiles) {
    interact.toggleLoader();
    render.init(penroseSettings, visibleTiles);
    interact.setDownloadLink(render.getMarkup());
};
