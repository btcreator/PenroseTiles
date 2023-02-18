/** This module is for:
 * - gathering the input settings data (then pass it to the generator)
 * - set the handlers for the menu items (event listeners)
 * - paste the Live View image
 * - pass the changed input data to update the live View
 * - create a downloadable svg image and
 * - set the download link
 */
import { toggleSwitchOrHide } from '../helpers';

// Interaction elements (buttons, menus)
const floatingMenu = document.querySelector('.floating-menu');
const menuButton = document.querySelector('.hamburger');
const settingsButtons = document.querySelector('.settings-buttons');
const subMenu = document.querySelector('.sub-menu');
const submenuChildren = Array.from(subMenu.children);
// Input elements
const formInputWidth = document.querySelector('#width');
const formInputHeight = document.querySelector('#height');
const formInputColorKite = document.querySelector('#color_kite');
const formInputColorDart = document.querySelector('#color_dart');
const formInputDensity = document.querySelector('#density');
const formInputRotation = document.querySelector('#rotation');
const formInputsDecorationColor = document.querySelectorAll('.decoration-color input');
const formInputDecoration = document.querySelector('.decoration');
// Special settings inputs
const formInputColorFrom = document.querySelector('#color_from');
const formInputColorTo = document.querySelector('#color_to');
const formInputGradDistance = document.querySelector('#grad_distance');
const formInputGradRotation = document.querySelector('#grad_rotation');
const formInputGradSpread = document.querySelector('#grad_spread');
const formInputArcRadiusScale = document.querySelector('#arc_radius_scale');
const formInputLargeArcFlag = document.querySelector('#large_arc_flag');
const formInputSweepFlag = document.querySelector('#sweep_flag');
// Special settings control inputs/elements
const formInputSpecRandom = document.querySelector('#random_tile_color');
const formInputSpedGradient = document.querySelector('#gradient_tile_color');
const wrapSpecialColorings = [...document.querySelectorAll('.special-coloring-opt')];
const wrapAdvancedArcs = [...document.querySelectorAll('.advanced-arc-opt')];
// Elements for interaction btw. decoration and decoration color
const wrapDecorationColors = [...document.querySelectorAll('.decoration-type-color')];
// Loader
const loader = document.querySelector('.loader');
const message = document.querySelector('.loader-message');

// Add listeners for all interaction elements, gather the input information after submit and call the generator function
export const interactionHandler = function (patternGenerator, liveImgContainer, updateLiveView) {
    addHandlersToMenuItems(liveImgContainer);
    addOnInputChangeHandlers(updateLiveView);

    // add listener for the generate / submit button
    subMenu.addEventListener('submit', ev => {
        ev.preventDefault();

        // set gathered inputs together as settings
        const penroseSettings = getInitSettings();

        // requestAnimationFrame for not lagging of the submenu closing window animation and showing the loader icon
        requestAnimationFrame(() => {
            toggleLoader('Generating...');
            toggleSwitchOrHide(submenuChildren);
            requestAnimationFrame(() => patternGenerator(penroseSettings));
        });
    });
};

// Gathering and return inputs
export const getInitSettings = function () {
    const arcRadiusScaleTemp = formInputArcRadiusScale.valueAsNumber;
    return {
        width: formInputWidth.valueAsNumber || window.innerWidth,
        height: formInputHeight.valueAsNumber || window.innerHeight,
        tileColor: {
            kite: formInputColorKite.value,
            dart: formInputColorDart.value,
        },
        scale: Number(formInputDensity.max) + Number(formInputDensity.min) - formInputDensity.valueAsNumber,
        rotation: formInputRotation.valueAsNumber,
        decoration: document.querySelector('.decoration input:checked').value,
        decorationColor: {
            amman: document.querySelector('#color_amman').value,
            arcs: {
                large: document.querySelector('#color_arc_large').value,
                small: document.querySelector('#color_arc_small').value,
            },
        },
        special: {
            random: formInputSpecRandom.checked,
            gradient: formInputSpedGradient.checked,
            // TODO special arc checked
            color: {
                from: formInputColorFrom.value,
                to: formInputColorTo.value,
            },
            gradDistance: formInputGradDistance.valueAsNumber,
            gradRotation: formInputGradRotation.valueAsNumber,
            gradSpread: formInputGradSpread.valueAsNumber,
            arcRadiusScale: arcRadiusScaleTemp < 2.5 ? (arcRadiusScaleTemp > 1 ? arcRadiusScaleTemp : 1) : 2.5,
            arcSwapLargeFlag: formInputLargeArcFlag.checked,
            arcSwapSweepFlag: formInputSweepFlag.checked,
        },
    };
};

// Create a downloadable file from the svg markup rendered on the viewport and set the link
export const setDownloadLink = function (svgMarkup) {
    const svg = '<?xml version="1.0" encoding="utf-8"?>' + svgMarkup;
    const blob = new Blob([svg]);
    const element = document.createElement('a');
    const container = document.querySelector('.download-link');
    element.innerText = 'Get SVG';
    element.download = 'myPenrose.svg';
    element.mimeType = 'image/svg+xml';
    element.href = window.URL.createObjectURL(blob);
    container.innerText = '';
    container.insertAdjacentElement('afterbegin', element);
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
        updateLiveView('decoration', ev.target.value);
        toggleSwitchOrHide(wrapDecorationColors, ev.target.value);
        // special arc decoration settings reveal or hide
        toggleSwitchOrHide(wrapAdvancedArcs, ev.target.value === 'arcs' ? 'arcs' : 'none');
    });
    // special coloring settings (random & gradient -coloring)
    [formInputSpecRandom, formInputSpedGradient].forEach(checkbox =>
        checkbox.addEventListener('click', ev => specialSettingsHandler(ev.target, updateLiveView))
    );
};

// Disable tile coloring, live view, and reveal the corresponding special settings tab
const specialSettingsHandler = function (target, updateLiveView) {
    let disableElements = false;

    wrapSpecialColorings.forEach(panel => {
        if (target.value === 'random')
            target.value === panel.dataset.toggle && panel.classList.toggle('hidden', !target.checked);
        else panel.classList.toggle('reveal', target.checked);
        disableElements =
            disableElements || !(panel.classList.contains('hidden') && !panel.classList.contains('reveal'));
    });

    formInputColorKite.disabled = formInputColorDart.disabled = disableElements;
    formInputColorKite.classList.toggle('disabled', disableElements);
    formInputColorDart.classList.toggle('disabled', disableElements);
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
