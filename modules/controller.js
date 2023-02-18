/** The controller in init
 * - calls the initUserMenu which initialize the main menu
 * - click on generate button is the penrosePatternGenerator called...and the magic begins ;)
 */
import 'core-js/stable';
import * as model from './model.js';
import * as view from './view.js';

const init = function () {
    view.initUserMenu(penrosePatternGenerator);
};

const penrosePatternGenerator = function (penroseSettings) {
    const visibleTiles = model.generatePatternTiles(penroseSettings);
    view.renderPenrosePattern(penroseSettings, visibleTiles);
    model.cleanUp();
};

init();

/** TODO
 * - show the estimated time to generate tiles
 *   - view.estimateGeneratingTime
 *   - implement it to interaction?
 * - cancel button when it takes too long to generate
 * - different coloring (todos in colorMaker)
 */
