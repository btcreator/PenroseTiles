import PenroseTile from './penroseTile.js';

export default class Kite extends PenroseTile {
    name = 'kite';

    // the closed agle of the side to the x axis (to the ref. axis)
    static refAngles = {
        a: 0,
        b: 108,
        c: 144,
        d: 252,
    };

    // rotation 0 mean, the 'a' side closes 0 deg with the x axis. This is the initial position of the tile.
    // rotation goes ccw
    constructor(rotation = 0) {
        super();
        this.rotation = rotation;
        this.#rotateKite();
    }

    // calculate the initial coordinates after rotation.
    #rotateKite() {
        this.#setShapeCoords();
        this.#setAmmanCoords();
    }
    #setAmmanCoords() {
        this.ammann.A1 = this.#calcAmmAn(this.ammDeg, this.ammLong);
        this.ammann.A2 = this.#calcAmmAn(72, this.ammShort);
        this.ammann.A3 = this.#calcAmmAn(0, this.ammShort);
        this.ammann.A4 = this.#calcAmmAn(72 - this.ammDeg, this.ammLong);
    }

    #calcAmmAn(deg, radius) {
        const rotInRad = this.toRad(deg + this.rotation);
        return [Math.cos(rotInRad) * radius, Math.sin(rotInRad) * radius];
    }

    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.#clacBCD(0);
        this.coord.C = this.#clacBCD(1);
        this.coord.D = this.#clacBCD(2);
    }

    // calculate the initial coordinates of BCD points. The ref. point is A in [0,0].
    #clacBCD(multipl) {
        const rotInRad = this.toRad(multipl * 36 + this.rotation);
        return [Math.cos(rotInRad), Math.sin(rotInRad)];
    }
}

Kite.prototype.ammDeg = 27.22764488;
Kite.prototype.ammShort = 0.19098300562;
Kite.prototype.ammLong = 0.96352549156;

// inner closed angle in the points (i.e. B: the angle closed by the 'a' and 'b' sides)
Kite.prototype.pointAngles = {
    A: 72,
    B: 72,
    C: 144,
    D: 72,
};
