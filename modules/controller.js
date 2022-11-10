/** The controller in init 
 * - call the interactionHandler which grabs the settings inputs set from user and invoke the pattern generator which...
 * - genarate the tiles (model)
 * - render the tiles on the screen (view)
 * - set download link (interact)
 * - then clean the states
 */
import 'core-js/stable';
import * as model from './model.js';
import * as view from './views/renderView.js';
import * as interact from './views/interactionView.js';

const init = function () {
    interact.interactionHandler(patternGenerator);
};

const patternGenerator = function (penroseSettings) {
    model.init(penroseSettings);
    view.init(penroseSettings, model.getVisibleTiles());
    interact.setDownloadLink(view.getMarkup());
    model.cleanUp();
};

init();

/** TODO 
 * - todos in dotManager
 * - cancel button when it takes too long to generate
 * - show the estimated time to generate tiles
 * - live example for settings
 * - different coloring (todos in colorMaker)
 * - allTiles in tile manager needed? I don't think so...remove from the documentation too when appears
 */
