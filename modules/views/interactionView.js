/** This module is for:
 * - gathering the input settings data (then pass it to the generator)
 * - set the handlers for the menu items (event listeners)
 * - paste the Live View image
 * - pass the changed input data to update the live View
 * - create a downloadable svg image and
 * - set the download link
 */
import { toggleSwitchOrHide } from '../helpers';
import * as modal from './interactionModal/modalView';

// Interaction elements (buttons, menus)
const floatingMenu = document.querySelector('.floating-menu');
const menuButton = document.querySelector('.hamburger');
const settingsButtons = document.querySelector('.settings-buttons');
const subMenu = document.querySelector('.sub-menu');
const submenuChildren = Array.from(subMenu.children);
// Input elements
const formInputColorKite = document.querySelector('#color_kite');
const formInputColorDart = document.querySelector('#color_dart');
const formInputDensity = document.querySelector('#density');
const formInputRotation = document.querySelector('#rotation');
const formInputsDecorationColor = document.querySelectorAll('.decoration-color input');
const formInputDecoration = document.querySelector('.decoration-types');
// Special settings control inputs/elements
const wrapSpecialColorings = [...document.querySelectorAll('.special-coloring-opt')];
const formInputSpecRandom = document.querySelector('#random_tile_color');
const formInputSpecGradient = document.querySelector('#gradient_tile_color');
const wrapAdvancedArc = [...document.querySelectorAll('.advanced-arc-opt')];
const advancedArcSettings = document.querySelector('.advanced-arc-opt.special-settings-panel');
const advancedArcFlagOpts = [...document.querySelectorAll('.flag-opt')].reduce((acc, opt) => {
    acc[opt.name] = opt;
    return acc;
}, {});
const advancedArcRadiusScale = {
    large: document.querySelector('#large_radius_scale'),
    small: document.querySelector('#small_radius_scale'),
};
// Elements for interaction btw. decoration and decoration color
const wrapDecorationColors = [...document.querySelectorAll('.decoration-type-color')];
// Special settings info buttons
const infoBtns = document.querySelectorAll('.header img');
// Loader
const loader = document.querySelector('.loader');
const message = document.querySelector('.loader-message');

// Add listeners for all interaction elements, gather the input information after submit and call the generator function
export const interactionHandler = function (penrosePatternGenerator, liveImgContainer, updateLiveView) {
    addHandlersToMenuItems(liveImgContainer);
    addOnInputChangeHandlers(updateLiveView);
    modal.init();

    // add listener for the generate / submit button
    subMenu.addEventListener('submit', ev => {
        ev.preventDefault();

        // set gathered inputs together as settings
        const penroseSettings = getInitSettings();

        // requestAnimationFrame for not lagging of the submenu closing window animation and showing the loader icon
        requestAnimationFrame(() => {
            toggleLoader('Generating...');
            toggleSwitchOrHide(submenuChildren);
            requestAnimationFrame(() => penrosePatternGenerator(penroseSettings));
        });
    });
};

// Gathering and return inputs
export const getInitSettings = function () {
    const settingsData = new FormData(subMenu);
    return adjustSettings(settingsData);
};

// Create a downloadable file from the svg markup rendered on the viewport and set the link
export const setDownloadLink = function (svgMarkup) {
    const svg = '<?xml version="1.0" encoding="utf-8"?>' + svgMarkup;
    const blob = new Blob([svg]);
    const element = document.createElement('a');
    const container = document.querySelector('.download-link');
    element.innerText = 'Download SVG';
    element.download = 'myPenrose.svg';
    element.mimeType = 'image/svg+xml';
    element.href = window.URL.createObjectURL(blob);
    container.innerText = '';
    container.insertAdjacentElement('afterbegin', element);
};

// Adjust the input values for further use and return an settings Object
const adjustSettings = function (settingsData) {
    const scale = 110 - settingsData.get('density'); // 110 because of max + min ranges
    settingsData.delete('density');
    settingsData.set('scale', scale);
    settingsData.set('width', settingsData.get('width') || window.innerWidth);
    settingsData.set('height', settingsData.get('height') || window.innerHeight);
    // special settings adjustments
    settingsData.set('gradDistance', adjNumberBtwGeLe(settingsData.get('gradDistance'), 0, Infinity));
    settingsData.set('gradRotation', adjNumberBtwGeLe(settingsData.get('gradRotation'), 0, 360));
    settingsData.set('gradSpread', adjNumberBtwGeLe(settingsData.get('gradSpread'), 0, 100));
    settingsData.set('largeRadiusScale', adjNumberBtwGeLe(settingsData.get('largeRadiusScale'), 0, 3));
    settingsData.set('smallRadiusScale', adjNumberBtwGeLe(settingsData.get('smallRadiusScale'), 0, 3));

    const rawSettings = Array.from(settingsData.entries());

    return rawSettings.reduce((adjObj, [key, val]) => {
        const adjVal = isNaN(+val) ? val : +val;
        adjObj[key] = adjVal;
        return adjObj;
    }, {});
};

// Add listener for the main menu
const addHandlersToMenuItems = function (liveImgContainer) {
    menuButton.addEventListener('click', () => {
        menuButton.innerText = menuButton.innerText === '≡' ? '×' : '≡';
        floatingMenu.classList.toggle('slide');
        toggleSwitchOrHide(submenuChildren);
    });

    settingsButtons.addEventListener('click', ev => {
        subMenuWindowHandler(ev.target.dataset.type, liveImgContainer);
    });

    infoBtns.forEach(infoBtn => infoBtn.addEventListener('click', modal.showModal));
};

// Add onchange listeners to inputs. When triggered, update the live view.
const addOnInputChangeHandlers = function (updateLiveView) {
    // density(scale) range change
    formInputDensity.addEventListener('input', function () {
        this.parentElement.querySelector('.range-display').innerText = this.value;
        updateLiveView('scale', this.value);
    });

    // rotation range change
    formInputRotation.addEventListener('input', function () {
        this.parentElement.querySelector('.range-display').innerText = `${this.value} deg`;
        updateLiveView('rotation', this.value + 'deg');
    });

    // tiles and decoration colors change
    formInputColorKite.addEventListener('input', ev => updateLiveView('kite', ev.target.value));
    formInputColorDart.addEventListener('input', ev => updateLiveView('dart', ev.target.value));
    formInputsDecorationColor.forEach(inputEl => {
        inputEl.addEventListener('input', ev => updateLiveView(ev.target.dataset.name, ev.target.value));
    });

    // decoration radio buttons change (and change of the decoration color in color sumbenu, and the special arc settings panel)
    formInputDecoration.addEventListener('click', ev => {
        if (!(ev.target.type === 'radio')) return;
        // special arc decoration settings reveal or hide
        const pseudoTarget = ev.target.value === 'arcs' ? 'arcs' : 'none';
        wrapAdvancedArc.forEach(el => el.classList.toggle('hidden', pseudoTarget !== el.dataset.toggle));

        // decoration color reveal on color menu
        wrapDecorationColors.forEach(el => el.classList.toggle('hidden', ev.target.value !== el.dataset.toggle));
        updateLiveView('decoration', ev.target.value);
    });

    // special coloring settings (random & gradient -coloring)
    [formInputSpecRandom, formInputSpecGradient].forEach(checkbox =>
        checkbox.addEventListener('click', () => specialColorSettingsHandler(updateLiveView))
    );

    // special arc flags settings
    advancedArcSettings.addEventListener('click', ev => {
        if (ev.target.type !== 'checkbox') return;
        advancedArcSettingsHandler(updateLiveView, ev.target.name);
    });

    // special arc radius scale change
    Object.values(advancedArcRadiusScale).forEach(input =>
        input.addEventListener('input', ev => {
            advancedArcSettingsHandler(updateLiveView, ev.target.name);
        })
    );
};

// Gather all the states of the checkboxes (flags), scales and update the specific arcs (large or small)
const advancedArcSettingsHandler = function (updateLiveView, targetName) {
    const changingGroup = targetName.includes('large') ? 'large' : 'small';
    const scale = advancedArcRadiusScale[changingGroup].valueAsNumber || 0;
    const obj = {
        name: changingGroup,
        data: {
            radiusScale: adjNumberBtwGeLe(scale, 0, 3),
            state: [
                +advancedArcFlagOpts[`${changingGroup}LArcFlag`].checked,
                +advancedArcFlagOpts[`${changingGroup}SweepFlag`].checked,
            ],
        },
    };

    updateLiveView('advancedArc', obj);
};

// Disable tile coloring, live view, and reveal the corresponding special settings tab
const specialColorSettingsHandler = function (updateLiveView) {
    wrapSpecialColorings.forEach(panel => {
        // panel.classList.toggle('hidden', panel.dataset.toggle === 'random' ? !(formInputSpecRandom.checked || formInputSpecGradient.checked) : !formInputSpecGradient.checked);

        if (panel.dataset.toggle === 'random')
            panel.classList.toggle('hidden', !(formInputSpecRandom.checked || formInputSpecGradient.checked));
        else panel.classList.toggle('hidden', !formInputSpecGradient.checked);
    });

    const disableElements = formInputSpecRandom.checked || formInputSpecGradient.checked;
    formInputColorKite.disabled = formInputColorDart.disabled = disableElements;
    formInputColorKite.classList.toggle('disabled', disableElements);
    formInputColorDart.classList.toggle('disabled', disableElements);

    // disable the gradient spread input element when random is checkd
    document.querySelector('#grad_spread').disabled = formInputSpecRandom.checked;

    updateLiveView('disabled', disableElements);
};

// Show / hide submenu window on corresponding button click and replace the live image
const subMenuWindowHandler = function (subMenuName, liveImgContainer) {
    if (!subMenuName) return;

    document.querySelector(`.${subMenuName} .image-holder`).appendChild(liveImgContainer);
    toggleSwitchOrHide(submenuChildren, subMenuName);
};

// Toggle loader and change text
export const toggleLoader = function (msg = message.innerText) {
    message.innerText = msg;
    loader.classList.toggle('hidden');
};

// Check if the munber is between (greater / lower) or equal with the tresholds (ge / le), when yes, return the treshold limit
const adjNumberBtwGeLe = function (check, ge, le) {
    return check >= ge ? (check <= le ? check : le) : ge;
};
