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
const formInputSpecRandom = document.querySelector('#random_tile_color');
const formInputSpedGradient = document.querySelector('#gradient_tile_color');
const formInputSpecAdvancedArc = document.querySelector('#advanced_arc_settings');
const inputFormAdvancedArcPanel = document.querySelector('.advanced-arc');
// Element for interaction btw. decoration and decoration color
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
    return {
        width: formInputWidth.valueAsNumber || window.innerWidth,
        height: formInputHeight.valueAsNumber || window.innerHeight,
        tileColor: {
            kite: formInputColorKite.value,
            dart: formInputColorDart.value,
        },
        density:
            Number(formInputDensity.max) +
            Number(formInputDensity.min) -
            formInputDensity.valueAsNumber,
        rotation: formInputRotation.valueAsNumber,
        decoration: document.querySelector('.decoration input:checked').value,
        decorationColor: {
            amman: document.querySelector('#color_amman').value,
            arcs: {
                large: document.querySelector('#color_arc_large').value,
                small: document.querySelector('#color_arc_small').value,
            },
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
    // density range change
    formInputDensity.addEventListener('input', function () {
        this.parentElement.querySelector('.range-display').innerText = this.value;
        updateLiveView('density', this.value);
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
        inputEl.addEventListener('input', ev =>
            updateLiveView(ev.target.dataset.name, ev.target.value)
        );
    });
    // decoration radio buttons change (and change of the decoration color in color sumbenu)
    formInputDecoration.addEventListener('click', ev => {
        if (!ev.target.checked) return;
        updateLiveView('decoration', ev.target.value);
        toggleSwitchOrHide(wrapDecorationColors, ev.target.value);
    });
    // special coloring settings (random-coloring)
    formInputSpecRandom.addEventListener('click', ev => {
        formInputColorKite.disabled = formInputColorDart.disabled = ev.target.checked
            ? true
            : false;
        formInputColorKite.classList.toggle('disabled', ev.target.checked);
        formInputColorDart.classList.toggle('disabled', ev.target.checked);
        updateLiveView("disabled", ev.target.checked);
    });
    // special arc decoration settings
    formInputSpecAdvancedArc.addEventListener('click', ev => {
        inputFormAdvancedArcPanel.classList.toggle("hidden", ev.target.checked); // continue
        // loop set hiden 
        // unhide checkbox when arc is set, otherwise hide
        // make panel in html + css
        // create gradient panel in html + css
        // hide / unhide gradient panel when the gradient checkbox is checked
        // set the input values, when generate is pressed
        // use these in render view
        // colors add to colorMaker
        // make random and gradient coloring in colorMaker
    })
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
