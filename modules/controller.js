import 'core-js/stable';
import * as model from './model.js';
import * as view from './views/renderView.js';
import * as interact from './views/interactionView.js';

// interact in init grabs the settings inputs set from user and invoke the pattern generator with those.
const init = function () {
    interact.interactionHandler(patternGenerator);
};

// model generates the tiles,
// view render the tiles on the screen
// interact set the download link
// clear the states
const patternGenerator = function (penroseSettings) {
    model.init(penroseSettings);
    view.init(penroseSettings, model.getVisibleTiles());
    interact.setDownloadLink(view.getMarkup());
    model.cleanUp();
};

init();

/** TODO - cancel button when it takes too long to generate
 * show the estimated time to generate tiles
 */
