const containerMainChildren = [...document.querySelector('.main-container').children];
const veil = document.querySelector('.veil');
const closeModalBtn = document.querySelector('.close-modal');
const modal = document.querySelector('.modal');

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

let slideId = 0;
let actualSliderName;

export const init = function () {
    veil.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);
    dotsContainer.addEventListener('click', sliderDotControl);
    slidersHolder.addEventListener('click', sliderArrowControl);
    slidersHolder.addEventListener('mouseover', showHideArrow);
    slidersHolder.addEventListener('mouseout', showHideArrow);
    createNavArrows();
    createDotElements();
};

export const showModal = function (event) {
    containerMainChildren.forEach(child => child.classList.add('blur'));
    veil.classList.remove('hidden');
    modal.classList.remove('hidden');

    actualSliderName = event.target.dataset.name;
    document.querySelector(`.modal-${actualSliderName}`).classList.remove('hidden');
    dotsContainer.append(...dots[actualSliderName]);
};

const hideModal = function () {
    veil.classList.add('hidden');
    containerMainChildren.forEach(child => child.classList.remove('blur'));
    modal.classList.add('hidden');
    document.querySelector(`.modal-${actualSliderName}`).classList.add('hidden');
    dotsContainer.innerHTML = '';
};

const showHideArrow = function () {
    this.parentElement.classList.toggle('with-arrow');
};

const sliderArrowControl = function (ev) {
    ev.layerX - this.clientWidth / 2 < 0 ? slideTo(slideId - 1) : slideTo(slideId + 1);
};

const sliderDotControl = function (ev) {
    ev.target.dataset.id && slideTo(+ev.target.dataset.id);
};

const slideTo = function (id) {
    const slides = sliders[actualSliderName];
    console.log(actualSliderName);
    slideId = id < 0 ? slides.length - 1 : id % slides.length;
    slides.forEach((slide, i) => {
        slide.classList.toggle('show-slide', slideId === i);
        dots[actualSliderName][i].classList.toggle('selected', slideId === i);
    });
};

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

const createNavArrows = function () {
    const leftArrow = document.createElement('div');
    leftArrow.classList.add('nav-arrow');
    const rightArrow = leftArrow.cloneNode();
    leftArrow.classList.add('left-arrow');
    rightArrow.classList.add('right-arrow');

    leftArrow.innerHTML = '&#10094;';
    rightArrow.innerHTML = '&#10095;';

    slidersHolder.parentElement.append(leftArrow, rightArrow);
};
