export default class PenroseTile {
    static points = ['A', 'B', 'C', 'D'];

    // the rule: 7 different tile kombination is possible around one dot. Each possibility is listed here with possible tile
    // and point joining to the dot in the right order, in clockwise direction. After the last element comes the first one.
    // It means, this tiles goes in round.
    static dotConnRules = [
        ['dart A', 'dart A', 'dart A', 'dart A', 'dart A'],
        ['dart C', 'kite D', 'kite B'],
        ['kite A', 'kite A', 'kite A', 'kite A', 'kite A'],
        ['dart A', 'dart A', 'dart A', 'kite B', 'kite D'],
        ['kite C', 'dart D', 'kite A', 'kite A', 'dart B'],
        ['dart A', 'kite B', 'kite D', 'kite B', 'kite D'],
        ['dart B', 'kite C', 'kite C', 'dart D'],
    ];
    coord = {}; // {A: [254,854], B: [658,78],...D: [658,74]}
    decor = {};

    // The occupation of the points with dots.
    dots = {
        A: null,
        B: null,
        C: null,
        D: null,
    };

    constructor(decoration) {
        this.decor.type = decoration === 'none' ? null : decoration;
        this.decor.coord = {};
    }

    // get neighbour point (-n: previous n-th, n: next n-th)
    static getNeigPointN(initPoint, n = 1) {
        return this.points.at((this.points.indexOf(initPoint) + n) % 4);
    }

    // add the dot to the corresponding point
    addDot(dot, point) {
        this.dots[point] = dot;
    }

    // scale tile (before rendering)
    scaleTile(by) {
        for (const [_, coord] of Object.entries(this.coord)) {
            coord[0] *= by;
            coord[1] *= by;
        }
        if (!this.decor.type) return this;

        for (const [_, decoord] of Object.entries(this.decor.coord)) {
            decoord[0] *= by;
            decoord[1] *= by;
        }
        return this;
    }

    // move tile to x,y position (before rendering)
    moveToPos(x, y) {
        for (const [_, coord] of Object.entries(this.coord)) {
            coord[0] += x;
            coord[1] += y;
        }
        if (!this.decor.type) return this;

        for (const [_, decoord] of Object.entries(this.decor.coord)) {
            decoord[0] += x;
            decoord[1] += y;
        }
        return this;
    }

    // degree to radian converter
    toRad(deg) {
        return (deg * Math.PI) / 180;
    }
}
PenroseTile.prototype.phi = (1 + Math.sqrt(5)) / 2;
