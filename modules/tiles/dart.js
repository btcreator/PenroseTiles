import PenroseTile from './penroseTile.js';

export default class Dart extends PenroseTile {
    name = 'dart';

    // The agle of the side to the x axis (to the ref. axis) (for example: b - the angle btw. x axis and b side)
    static refAngles = {
        a: 0,
        b: 144,
        c: 108,
        d: 252,
    };

    // Rotation 0 mean, the angle between 'a' side and the x axis is 0 deg. This is the initial position of the tile.
    // rotation goes ccw
    constructor(rotation, decoration) {
        super(rotation);
        this.#createDart(decoration);
    }

    #createDart(decoration) {
        this.#setShapeCoords();
        if (decoration === 'none') return;
        decoration === 'amman' ? this.#setAmmanCoords() : this.#setArcsCoords();
    }

    // Calculate the initial coordinates.
    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.polarToRect(0);
        this.coord.C = this.polarToRect(36, 1 / PenroseTile.phi);
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
        this.decoord.A2 = this.polarToRect(0, this.ammShort);
        this.decoord.A3 = this.polarToRect(72, this.ammShort);
        this.decoord.A4 = this.polarToRect(72 - this.ammDeg, this.ammLong);
    }
}

Dart.prototype.ammDeg = 5.92561393;
Dart.prototype.ammShort = 0.80901699438;
Dart.prototype.ammLong = 0.87980044657;

Dart.prototype.arcDeg = 18;
Dart.prototype.arcRadiusL = (PenroseTile.phi - 1) ** 2;
Dart.prototype.arcRadiusS = 1 / (PenroseTile.phi * (1 + PenroseTile.phi));
Dart.prototype.arcLong = 0.726542528; // 0.72654252800536088589546675748062;
Dart.prototype.arcShort = (PenroseTile.phi - 1) ** 2;

// Inner angle at the points (for example: B: the angle between the 'a' and 'b' sides)
Dart.prototype.pointAngles = {
    A: 72,
    B: 36,
    C: 216,
    D: 36,
};
