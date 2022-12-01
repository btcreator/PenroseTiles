import PenroseTile from './penroseTile.js';

export default class Kite extends PenroseTile {
    name = 'kite';

    // The agle of the side to the x axis (to the ref. axis) (for example: b - the angle btw. x axis and b side)
    static refAngles = {
        a: 0,
        b: 108,
        c: 144,
        d: 252,
    };

    // Rotation 0 mean, the angle between 'a' side and the x axis is 0 deg. This is the initial position of the tile.
    // rotation goes ccw
    constructor(rotation, decoration) {
        super(rotation);
        this.#createKite(decoration);
    }

    #createKite(decoration) {
        this.#setShapeCoords();
        if (decoration === 'none') return;
        decoration === 'amman' ? this.#setAmmanCoords() : this.#setArcsCoords();
    }

    // Calculate the initial coordinates.
    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.polarToRect(0);
        this.coord.C = this.polarToRect(36);
        this.coord.D = this.polarToRect(72);
    }

    #setArcsCoords() {
        this.decoord.A1 = this.polarToRect(0, this.arcShort);
        this.decoord.A2 = this.polarToRect(72, this.arcShort);
        this.decoord.A3 = this.polarToRect(72 - this.arcDeg, this.arcLong);
        this.decoord.A4 = this.polarToRect(this.arcDeg, this.arcLong);
    }

    #setAmmanCoords() {
        this.decoord.A1 = this.polarToRect(this.ammDeg, this.ammLong);
        this.decoord.A2 = this.polarToRect(72, this.ammShort);
        this.decoord.A3 = this.polarToRect(0, this.ammShort);
        this.decoord.A4 = this.polarToRect(72 - this.ammDeg, this.ammLong);
    }
}

Kite.prototype.ammDeg = 27.22764488;
Kite.prototype.ammShort = 0.19098300562;
Kite.prototype.ammLong = 0.96352549156;

Kite.prototype.arcDeg = 13.61382244;
Kite.prototype.arcRadiusL = PenroseTile.phi - 1;
Kite.prototype.arcRadiusS = (PenroseTile.phi - 1) ** 2;
Kite.prototype.arcLong = 0.95385012253; // 0.95385012253001559226940545493956
Kite.prototype.arcShort = PenroseTile.phi - 1;

// Inner angle at the points (for example: B: the angle between the 'a' and 'b' sides)
Kite.prototype.pointAngles = {
    A: 72,
    B: 72,
    C: 144,
    D: 72,
};
