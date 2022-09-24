export default class Dot {
    // *** id is needed for track the dot when we create a new tile. ( the id is created from the coordinates,
    // i.e. when we create a new tile we can then check the exixtence of the dots at the new coordinates).
    // *** occupy track the joined tiles to the dot (tile and the point)
    // *** totalDegree is for track, the dot is full or not. When it reaches 360, then the dot is done, no more tile can be added
    // *** nextPossTiles is for save the possible tiles that can be attached to the dot. (We would search for "just one attachable"
    // dots first of all.)
    #id;
    #coord; // [154.4555, 456.87452]
    occupy = []; // [{tile: TileObj, point: "A"},{tile: TileObj, point: "B"},...]
    #totalDegree = 0;
    #nextPossTiles = {
        ccw: [], // [{name: "kite", point: "A"}, {name: "dart", point: "B"}]
        cw: [],
    };

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
        const adjCoord = coord.map(xy => Math.round(xy * 100) / 100); // adjusted because of floating point failure
        return `${Math.round(adjCoord[0])}-${Math.round(adjCoord[1])}`;
    }

    // the tiles are listed in cw direction in the occupy variable. Between the last and first element is the gap.
    // When a new tile is added, the dir gives where the tile is attached. It would be the new last or first element.
    // dir 1 is attached cw, 0 ccw from the gaps point of view.
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

    // as next possible tiles by the gaps on both sides (cw or ccw) gives back the one, which has just 1 possibilities.
    // when both have just one or two, in that case its no matter which one is returned (in our case is that always the
    // possibilites on cw side).
    get nextPossTiles() {
        return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
            ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
            : { tiles: this.#nextPossTiles.cw, dir: 1 };

        // return this.#nextPossTiles.cw.length > this.#nextPossTiles.ccw.length
        //   ? { tiles: this.#nextPossTiles.ccw, dir: 0 }
        //   : { tiles: this.#nextPossTiles.cw, dir: 1 };
    }
    set nextPossTiles(possTilesByRule) {
        this.#nextPossTiles.ccw = possTilesByRule.ccw;
        this.#nextPossTiles.cw = possTilesByRule.cw;
    }
}
