/**********************************************
 * Legend *************************************
 * Point: The point of the tile. This is just a character of the side joints "A", "B"...
 * Dot: This joins tile points together to a node. Dots are the joint points of more tiles.
 * Direction 1 means Clockwise
 * Direction 0 means Counterclockwise
 */
import 'core-js/stable';
import * as model from './model.js';
import * as view from './views/renderView.js';
import * as interact from './views/interactionView.js';

const init = function () {
    interact.interactionHandler(patternGenerator);
};

const patternGenerator = function (penroseSettings) {
    const colorPalette = {
        kiteColor: penroseSettings.kiteColor,
        dartColor: penroseSettings.dartColor,
    };

    model.init(penroseSettings);
    view.init(penroseSettings.width, penroseSettings.height, colorPalette, model.getVisibleTiles());
    interact.setDownloadLink(view.getMarkup());
    model.cleanUp();
};

init();

/** cancel button when it takes too long
 * show the estimated time to generate tiles
 */
