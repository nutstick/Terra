import * as THREE from 'three';

export interface CartesianOptions {
    x?: number;
    y?: number;
    z?: number;
    height?: number;
}

export class Cartesian {
    _x: number = 0;
    _y: number = 0;
    _z: number = 0;

    constructor(options?: CartesianOptions) {
        options = options || {};
        this._x = options.x || 0;
        this._y = options.y || 0;
        this._z = options.height || options.z || 0;
    }

    set(x, y, z) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    dot(...args): number {
        return THREE.Vector3.prototype.dot.call(this, ...args);
    }

    add(o) {
        this._x += o.x;
        this._y += o.y;
        this._z += o.z;
        return this;
    }
    crossVectors = THREE.Vector3.prototype.crossVectors;
    addVectors = THREE.Vector3.prototype.addVectors;
    subVectors(a, b) {
        this._x = a.x - b.x;
        this._y = a.y - b.y;
        this._z = a.z - b.z;
        return this;
    }
    normalize = THREE.Vector3.prototype.normalize;

    clone() {
        return new Cartesian({
            x: this._x,
            y: this._y,
            z: this._z,
        });
    }

    copy(other) {
        this._x = other.x;
        this._y = other.y;
        this._z = other.z;
    }

    get x() { return this._x; }
    set x(x) { this._x = x; }
    get y() { return this._y; }
    set y(y) { this._y = y; }
    get z() { return this._z; }
    set z(z) { this._z = z; }
    get height() { return this._y; }
    set height(height) { this._y = height; }
}
