// Performance optimization utilities for Slither.io

export class SpatialGrid {
  constructor(worldWidth, worldHeight, cellSize = 200) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(worldWidth / cellSize);
    this.rows = Math.ceil(worldHeight / cellSize);
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  getCellKey(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col},${row}`;
  }

  insert(object, x, y) {
    const key = this.getCellKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(object);
  }

  getNearby(x, y, radius = 1) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const nearby = [];

    // Check surrounding cells
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const key = `${col + i},${row + j}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key));
        }
      }
    }

    return nearby;
  }
}

export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = new Set();

    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  get() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }

  releaseAll() {
    this.inUse.forEach(obj => {
      this.resetFn(obj);
      this.available.push(obj);
    });
    this.inUse.clear();
  }
}
