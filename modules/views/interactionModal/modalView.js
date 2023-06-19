/** modalView is part of the interaction. It's a submodul of the interactionView.
 * create navigation elements like
 * - dots and arrows
 * attache listeners and show / hide the info modal-window for
 * - special colorings (color)
 * - advanced arc settings (decoration)
 */

// Select elements for modal
const mainContainerChildrens = [...document.querySelector('.main-container').children];
const veil = document.querySelector('.veil');
const closeModalBtn = document.querySelector('.close-modal');
const modalWindow = document.querySelector('.modal');

// Elements for create the slider in the modal window
const slidersHolder = document.querySelector('.sliders-wrapper');
const sliders = {
    color: [...document.querySelector('.modal-color').children],
    arc: [...document.querySelector('.modal-arc').children],
};
const dotsContainer = document.querySelector('.dots');
const dots = {
    color: [],
    arc: [],
};

// Save the actual state
let slideId = 0;
let actualSliderName;

// set all listeners for the modal interaction and create the navigation elements
export const init = function () {
    veil.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);
    dotsContainer.addEventListener('click', sliderDotControl);
    slidersHolder.addEventListener('click', sliderArrowControl);
    slidersHolder.addEventListener('mouseover', showHideArrow);
    slidersHolder.addEventListener('mouseout', showHideArrow);
    createAndSetNavArrows();
    createDotElements();
};

// Show the modal window and set the slider which corresponds to the clicked element
export const showModal = function (event) {
    // manage modal "effekt"
    mainContainerChildrens.forEach(child => child.classList.add('blur'));
    veil.classList.remove('hidden');
    modalWindow.classList.remove('hidden');

    // check if the same modal gets open like before, when not, set it to first info box
    if(actualSliderName !== event.target.dataset.name) {
        actualSliderName = event.target.dataset.name;
        slideTo(0);
    }

    // manage slider
    document.querySelector(`.modal-${actualSliderName}`).classList.remove('hidden');
    dotsContainer.append(...dots[actualSliderName]);
};

// Hide modal window
const hideModal = function () {
    veil.classList.add('hidden');
    mainContainerChildrens.forEach(child => child.classList.remove('blur'));
    modalWindow.classList.add('hidden');
    document.querySelector(`.modal-${actualSliderName}`).classList.add('hidden');
    dotsContainer.innerHTML = '';
};

// The arrows appearance is controlled through css
const showHideArrow = function () {
    this.parentElement.classList.toggle('with-arrow');
};

// Slides to the previous or next info...
// ...when clicked on the left or right half of the information box
const sliderArrowControl = function (ev) {
    ev.layerX - this.clientWidth / 2 < 0 ? slideTo(slideId - 1) : slideTo(slideId + 1);
};

// ...corresponding with the clicked dot
const sliderDotControl = function (ev) {
    ev.target.dataset.id && slideTo(+ev.target.dataset.id);
};

// Slides to the info box based on passed id
const slideTo = function (id) {
    const slides = sliders[actualSliderName];
    slideId = id < 0 ? slides.length - 1 : id % slides.length;
    slides.forEach((slide, i) => {
        slide.classList.toggle('show-slide', slideId === i);
        dots[actualSliderName][i].classList.toggle('selected', slideId === i);
    });
};

// Just create the dots for all slides and save it to 
const createDotElements = function () {
    for (let [name, arr] of Object.entries(sliders)) {
        arr.forEach((slide, i) => {
            const element = document.createElement('div');
            element.classList.toggle('selected', slide.classList.contains('show-slide'));
            element.setAttribute('data-id', i);
            dots[name].push(element);
        });
    }
};

// Create the arrows, the insert it in the document
const createAndSetNavArrows = function () {
    const leftArrow = document.createElement('div');
    leftArrow.classList.add('nav-arrow');
    const rightArrow = leftArrow.cloneNode();
    leftArrow.classList.add('left-arrow');
    rightArrow.classList.add('right-arrow');

    leftArrow.innerHTML = '&#10094;';
    rightArrow.innerHTML = '&#10095;';

    slidersHolder.parentElement.append(leftArrow, rightArrow);
};
