// Stylesheet for the live view image (svg)
export const stylesheetText = `
#live-image {
    --kite: #000000;
    --dart: #000000;
    --amman: #000000;
    --large: #000000;
    --small: #000000;
    --density: 100;
    --rotation: 0deg;
}

.image-wrapper {
    width: 120px;
    height: 120px;
    overflow: hidden;
    border-radius: 50%;
    border: 7px solid #ffffff;
    outline: 1px solid #00000087;
}

#live-image p {
    margin: 5px 0 8px;
    text-align: center;
}

#live-sample svg {
    transform: scale(calc((110 - var(--density)) / 10)) rotate(var(--rotation));
}

#live-sample .decor {
    stroke-width: calc((178.75 - var(--density)) / (11.25 * (110 - var(--density))));
}

#bird-view svg {
    transform: rotate(var(--rotation));
}

.kite {
    fill: var(--kite);
}

.dart {
    fill: var(--dart);
}

.amman {
    stroke: var(--amman);
}

.large {
    stroke: var(--large);
}

.small {
    stroke: var(--small);
}

.hidden {
    display: none;
}

.disabled {
    transform: scale(1) rotate(0deg);
}
.disabled .kite,
.disabled .dart {
    fill: #e7e7e7;
}
.disabled .decor {
    display: none;
}
`;
