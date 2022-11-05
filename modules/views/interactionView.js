/** This module is for:
 * - gathering the input settings data (then pass it to the generator)
 * - set the handlers for the menu items (event listeners)
 * - create a downloadable svg image and
 * - set the download link */

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
const formInputColorsDecoration = document.querySelectorAll('.decoration-type-color');
// Use for controlling of decoration coloring
const wrapDecorationInputs = document.querySelector('.decoration');
const wrapColorDecorInputs = document.querySelector('.decoration-color');
const decorationColorImage = document.querySelector('.decoration-img');

// add listeners for all interaction elements, gather the input information after submit and call the received function
export const interactionHandler = function (patternGenerator) {
    addHandlersToMenuItems();

    // Add listener for the generate / submit button
    subMenu.addEventListener('submit', ev => {
        ev.preventDefault();

        // gathering inputs
        const penroseSettings = {
            width: formInputWidth.valueAsNumber || window.innerWidth,
            height: formInputHeight.valueAsNumber || window.innerHeight,
            kiteColor: formInputColorKite.value,
            dartColor: formInputColorDart.value,
            density:
                Number(formInputDensity.max) +
                Number(formInputDensity.min) -
                formInputDensity.valueAsNumber,
            rotation: formInputRotation.valueAsNumber,
            decoration: document.querySelector('.decoration input:checked').value,
            decorationColor: {
                amman: wrapColorDecorInputs.querySelector('#color_amman').value,
                arcs: {
                    large: wrapColorDecorInputs.querySelector('#color_arc_large').value,
                    small: wrapColorDecorInputs.querySelector('#color_arc_small').value,
                },
            },
        };

        // requestAnimationFrame for not lagging of close the submenu window
        requestAnimationFrame(() => {
            hideSubMenu();
            requestAnimationFrame(() => patternGenerator(penroseSettings));
        });
    });
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

// Add listeners for all menu / submenu elements and other menu items (except submit)
const addHandlersToMenuItems = function () {
    menuButton.addEventListener('click', () => {
        menuButton.innerText = menuButton.innerText === '≡' ? '×' : '≡';
        floatingMenu.classList.toggle('slide');
        hideSubMenu();
    });

    settingsButtons.addEventListener('click', ev => {
        subMenuWindowHandler(ev.target.dataset.type);
    });

    formInputDensity.addEventListener('input', function () {
        this.parentElement.querySelector('.range-display').innerText = this.value;
    });

    formInputRotation.addEventListener('input', function () {
        this.parentElement.querySelector('.range-display').innerText = `${this.value} deg`;
    });

    wrapDecorationInputs.addEventListener('click', function (e) {
        if (!e.target.checked) return;
        hide(formInputColorsDecoration);
        wrapColorDecorInputs.querySelector(`.${e.target.value}`).classList.remove('hidden');
        decorationColorImage.src = `decoration-${e.target.value}.png`;
    });
};

// show / hide submenu window on corresponding button click
const subMenuWindowHandler = function (subMenuName) {
    if (!subMenuName) return;

    const subMenuItem = document.querySelector(`.${subMenuName}`);
    subMenu.classList.remove('hidden');

    if (subMenuItem.classList.contains('hidden')) {
        hide(submenuChildren);
        subMenuItem.classList.toggle('hidden');
    } else {
        hideSubMenu();
    }
};

// hide submenu window
const hideSubMenu = function () {
    hide(submenuChildren);
    subMenu.classList.add('hidden');
};

const hide = function (toHide) {
    toHide.forEach(item => item.classList.add('hidden'));
};
