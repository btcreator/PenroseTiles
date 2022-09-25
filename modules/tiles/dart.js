import PenroseTile from './penroseTile.js';

export default class Dart extends PenroseTile {
    name = 'dart';

    // the closed agle of the side to the x axis (to the ref. axis)
    static refAngles = {
        a: 0,
        b: 144,
        c: 108,
        d: 252,
    };

    // rotation 0 mean, the 'a' side closes 0 deg with the x axis. This is the initial position of the tile.
    // rotation goes ccw
    constructor(rotation, decoration) {
        super(decoration);
        this.rotation = rotation;
        this.#rotateDart();
    }

    #rotateDart() {
        this.#setShapeCoords();
        if (!this.decor.type) return;
        this.decor.type === 'amman' ? this.#setAmmanCoords() : this.#setAmmanCoords(); // todo
    }

    #setAmmanCoords() {
        this.decor.coord.A1 = this.#calcAmmAn(this.ammDeg, this.ammLong);
        this.decor.coord.A2 = this.#calcAmmAn(0, this.ammShort);
        this.decor.coord.A3 = this.#calcAmmAn(72, this.ammShort);
        this.decor.coord.A4 = this.#calcAmmAn(72 - this.ammDeg, this.ammLong);
    }

    #calcAmmAn(deg, radius) {
        const rotInRad = this.toRad(deg + this.rotation);
        return [Math.cos(rotInRad) * radius, Math.sin(rotInRad) * radius];
    }

    // calculate the initial coordinates after rotation.
    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.#calcBCD(0);
        this.coord.C = this.#calcBCD(1);
        this.coord.D = this.#calcBCD(2);
    }

    // calculate the initial coordinates of BCD points. The ref. point is A in [0,0].
    #calcBCD(multipl, rotation) {
        const rotInRad = this.toRad(multipl * 36 + this.rotation);
        const distance = (multipl + 1) % 2 || 1 / this.phi;
        return [Math.cos(rotInRad) * distance, Math.sin(rotInRad) * distance];
    }
}

Dart.prototype.ammDeg = 5.92561393;
Dart.prototype.ammShort = 0.80901699438;
Dart.prototype.ammLong = 0.87980044657;

// inner closed angle in the points (i.e. B: the angle closed by the 'a' and 'b' sides)
Dart.prototype.pointAngles = {
    A: 72,
    B: 36,
    C: 216,
    D: 36,
};
