import PenroseTile from './penroseTile.js';

export default class Dart extends PenroseTile {
    name = 'dart';

    // the agle of the side to the x axis (to the ref. axis)
    static refAngles = {
        a: 0,
        b: 144,
        c: 108,
        d: 252,
    };

    // rotation 0 mean, the angle between 'a' side and the x axis is 0 deg. This is the initial position of the tile.
    // rotation goes ccw
    constructor(rotation, decoration) {
        super(decoration);
        this.rotation = rotation;
        this.#createDart();
    }

    #createDart() {
        this.#setShapeCoords();
        if (!this.decor.type) return;
        this.decor.type === 'amman' ? this.#setAmmanCoords() : this.#setArcsCoords();
    }

    #setArcsCoords() {
        this.decor.coord.A1 = this.#calcDecorAn(0, this.arcShort);
        this.decor.coord.A2 = this.#calcDecorAn(72, this.arcShort);
        this.decor.coord.A3 = this.#calcDecorAn(72 - this.arcDeg, this.arcLong);
        this.decor.coord.A4 = this.#calcDecorAn(this.arcDeg, this.arcLong);
    }

    #setAmmanCoords() {
        this.decor.coord.A1 = this.#calcDecorAn(this.ammDeg, this.ammLong);
        this.decor.coord.A2 = this.#calcDecorAn(0, this.ammShort);
        this.decor.coord.A3 = this.#calcDecorAn(72, this.ammShort);
        this.decor.coord.A4 = this.#calcDecorAn(72 - this.ammDeg, this.ammLong);
    }

    #calcDecorAn(deg, radius) {
        const rotInRad = this.toRad(deg + this.rotation);
        return [Math.cos(rotInRad) * radius, Math.sin(rotInRad) * radius];
    }

    // calculate the initial coordinates.
    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.#calcBCD(0);
        this.coord.C = this.#calcBCD(1);
        this.coord.D = this.#calcBCD(2);
    }

    // calculate the initial coordinates of BCD points with rotation. The ref. point is A in [0,0].
    #calcBCD(multipl) {
        const rotInRad = this.toRad(multipl * 36 + this.rotation);
        const distance = (multipl + 1) % 2 || 1 / PenroseTile.phi;
        return [Math.cos(rotInRad) * distance, Math.sin(rotInRad) * distance];
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

// inner angle at the points (i.e. B: the angle between the 'a' and 'b' sides)
Dart.prototype.pointAngles = {
    A: 72,
    B: 36,
    C: 216,
    D: 36,
};
