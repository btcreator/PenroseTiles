export default class Dot {
    // *** id is needed for track the dot when we create a new tile. ( the id is created from the coordinates,
    // and when we create a new tile we can then check the exixtence of the dots at the new coordinates).
    // *** occupy track the joined tiles to the dot (tile and the point)
    // *** totalDegree is for track, that the dot occupation is full or not. When it reaches 360, then the dot is done, no more tile can be added
    // *** nextPossTiles is for save the possible tiles that can be attached to the dot.
    #id;
    #coord; // [154.4555, 456.87452]
    occupy = []; // [{tile: TileObj, point: "A"},{tile: TileObj, point: "B"},...]
    #totalDegree = 0;
    #nextPossTiles = {
        ccw: [], // [{name: "kite", point: "A"}, {name: "dart", point: "B"}]
        cw: [],
    };
    borderPermission;

    constructor(coord) {
        this.#id = Dot.getID(coord);
        this.#coord = coord;
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

    static getID(coord) {
        const adjCoord = coord.map(xy => Math.round(xy * 100) / 100); // Adjusted because of floating point failure (e.g.: xx.49999...; xx.5)
        return `${Math.round(adjCoord[0])}-${Math.round(adjCoord[1])}`;
    }

    // The tiles are listed in cw direction in the occupy variable.
    // When a new tile is added, the dir (direction) gives where the tile is attached. It would be the new last or first element.
    // dir 1 = tile is attached cw (on the front of the Array). 0 = attached ccw (on the end of the Array).
    addTile(tile, tilePoint, dir) {
        dir
            ? this.occupy.unshift({ tile, point: tilePoint })
            : this.occupy.push({ tile, point: tilePoint });
        this.#totalDegree += tile.pointAngles[tilePoint];
    }

    removeTile(tile) {
        const index = this.occupy.findIndex(occupationObj => occupationObj.tile === tile);
        const point = this.occupy[index].point;

        this.#totalDegree -= tile.pointAngles[point];
        this.occupy.splice(index, 1);
    }

    // As next possible tiles on both sides (cw or ccw) gives back the one, which has just 1 possibility.
    // when both have just one or two, in that case its no matter which one is returned (in our case is that always the
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
