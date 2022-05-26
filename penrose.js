"use strict";

class PenroseTiles {
  phi = (1 + Math.sqrt(5)) / 2;
  constructor() {}
  toRad(deg) {
    return (deg * Math.PI) / 180;
  }
}

class Dart extends PenroseTiles {
  #coord;
  constructor(rotation = 0) {
    super();
    this.rotation = 0;
    this.#rotateDart(this.rotation);
  }

  #rotateDart(rotation) {
    const rotInRad = this.toRad(rotation);
    this.#coord.A = [0, 0];
    this.#coord.B = [
      Math.cos(rotInRad) * this.phi,
      Math.sin(rotInRad) * this.phi,
    ];
    this.#coord.C = [
      Math.cos(this.toRad(rotation + 36)),
      Math.sin(this.toRad(rotation + 36)),
    ];
    this.#coord.D = [
      Math.cos(this.toRad(rotation + 72)) * this.phi,
      Math.sin(this.toRad(rotation + 72)) * this.phi,
    ];
  }
}
