// random number btw. min and max
export const randomRange = function (max, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
};
