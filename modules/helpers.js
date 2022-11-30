// Random number btw. min and max
export const randomRange = function (max, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
};

// Toggle-switch items, when all hidden, hide the parent element too
export const toggleSwitchOrHide = function (itemArray, toToggleName = null) {
    // prettier-ignore
    const hideParent = itemArray.reduce((acc, item) => item.classList.toggle('hidden', !(item.dataset.toggle === toToggleName && item.classList.contains('hidden'))) && acc, true);
    itemArray[0].parentElement.classList.toggle('hidden', hideParent);
};
