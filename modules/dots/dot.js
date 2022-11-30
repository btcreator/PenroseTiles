/** Some legend:
 * id - is needed for track the dots when we create a new tile.
 * occupy - track the joined tiles to the dot (tile and the point) 
 * totalDegree - is for track, that the dot occupation is full or not. When it reaches 360, then the dot is fully occupied, no more tile can be added
 * nextPossTiles - is for save the possible tiles, that can be attached to the dot as next. 
 * borderPermission - to help determine which tile should be rendered or not */

export default class Dot {
   
    #id; // '254-613' - no decimals
    #coord; // [154.4555, 456.87452]
    occupy = []; // [{tile: TileObj, point: "A"},{tile: TileObj, point: "B"},...]
    #totalDegree = 0;
    #nextPossTiles = {
        ccw: [], // [{name: "kite", point: "A"}, {name: "dart", point: "B"}]
        cw: [],
    };
    borderPermission; // possible values: 0,1,-1,-2

    constructor(coord) {
        this.#id = Dot.getID(coord);
        this.#coord = coord;
    }

    static getID(coord) {
        const adjCoord = coord.map(xy => Math.round(xy * 100) / 100); // Adjusted because of floating point failure (e.g.: 15.49999...; 15.5 => quasi same coordinate - unadjusted ids were: 15; 16)
        return `${Math.round(adjCoord[0])}-${Math.round(adjCoord[1])}`;
    }

    get id() {
        return this.#id;
    }

    get coord() {
        return this.#coord;
    }

    get totalDegree() {
        return this.#totalDegree;
    }

    // The tiles are listed in cw direction in the occupy variable.
    // When a new tile is added, the dir (direction) gives where the tile is attached. It would be the new, last or first element.
    // dir 1 = tile is attached cw (on the front of the Array). 0 = attached ccw (on the end of the Array).
    addTile(tile, point, dir) {
        dir ? this.occupy.unshift({ tile, point })
            : this.occupy.push({ tile, point });
        this.#totalDegree += tile.pointAngles[point];
    }

    // The removed tile would be always the first or last when a "gap" issue happens (see documentation -> Issues)
    removeTile(tile) {
        const index = this.occupy.findIndex(occupationObj => occupationObj.tile === tile);
        const point = this.occupy[index].point;

        this.#totalDegree -= tile.pointAngles[point];
        this.occupy.splice(index, 1);
    }

    // As next possible tiles on both sides (cw or ccw) gives back the one, which has just 1 possibility.
    // when both have just one or two, in that case it's no matter which one is returned (in our case is that always the
    // possibily on cw side).
    get nextPossTiles() {
        return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
            ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
            : { tiles: this.#nextPossTiles.cw, dir: 1 };
    }

    set nextPossTiles(possTilesByRule) {
        this.#nextPossTiles = possTilesByRule;
    }
}
