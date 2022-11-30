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
        super(rotation, decoration);
        this.#createKite();
    }

    #createKite() {
        this.#setShapeCoords();
        if (!this.decor.type) return;
        this.decor.type === 'amman' ? this.#setAmmanCoords() : this.#setArcsCoords();
    }

    // Calculate the initial coordinates.
    #setShapeCoords() {
        this.coord.A = [0, 0];
        this.coord.B = this.#calcBCD(0);
        this.coord.C = this.#calcBCD(1);
        this.coord.D = this.#calcBCD(2);
    }

    // Calculate the initial coordinates of BCD points. The ref. point is A in [0,0].
    #calcBCD(multipl) {
        const rotInRad = this.toRad(multipl * 36 + this.rotation);
        return [Math.cos(rotInRad), Math.sin(rotInRad)];
    }

    #setArcsCoords() {
        this.decor.coord.A1 = this.#calcDecorAn(0, this.arcShort);
        this.decor.coord.A2 = this.#calcDecorAn(72, this.arcShort);
        this.decor.coord.A3 = this.#calcDecorAn(72 - this.arcDeg, this.arcLong);
        this.decor.coord.A4 = this.#calcDecorAn(this.arcDeg, this.arcLong);
    }

    #setAmmanCoords() {
        this.decor.coord.A1 = this.#calcDecorAn(this.ammDeg, this.ammLong);
        this.decor.coord.A2 = this.#calcDecorAn(72, this.ammShort);
        this.decor.coord.A3 = this.#calcDecorAn(0, this.ammShort);
        this.decor.coord.A4 = this.#calcDecorAn(72 - this.ammDeg, this.ammLong);
    }

    // Calculate the decorations A n-th (A1,A2..) coordinates
    #calcDecorAn(deg, radius) {
        const rotInRad = this.toRad(deg + this.rotation);
        return [Math.cos(rotInRad) * radius, Math.sin(rotInRad) * radius];
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
