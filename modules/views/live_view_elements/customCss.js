// Stylesheet for the live view image (svg)
export const stylesheetText = `
#live-image {
    --kite: #000000;
    --dart: #000000;
    --amman: #000000;
    --large: #000000;
    --small: #000000;
    --density: 110;
    --rotation: 0deg;

    width: 120px;
    height: 120px;
    overflow: hidden;
    border-radius: 50%;
}

#live-image svg{
    transform: scale(calc(var(--density)/10)) rotate(var(--rotation));
}

#kite {
    fill: var(--kite);
}

#dart {
    fill: var(--dart);
}

#amman {
    stroke: var(--amman);
}

#large {
    stroke: var(--large);
}

#small {
    stroke: var(--small);
}

.hidden {
    display: none;
}
`;
