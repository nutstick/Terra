import * as THREE from 'three';

export interface CartesianOptions {
    x?: number;
    y?: number;
    z?: number;
    height?: number;
}

const matrix = new THREE.Matrix4();
export class Cartesian {
    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;

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

        return this;
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
    sub(o) {
        this._x -= o.x;
        this._y -= o.y;
        this._z -= o.z;
        return this;
    }
    crossVectors(...args): Cartesian {
        return THREE.Vector3.prototype.crossVectors.call(this, ...args);
    }
    addVectors = THREE.Vector3.prototype.addVectors;
    subVectors(a, b) {
        this._x = a.x - b.x;
        this._y = a.y - b.y;
        this._z = a.z - b.z;
        return this;
    }
    normalize = THREE.Vector3.prototype.normalize;
    length = THREE.Vector3.prototype.length;
    multiplyScalar = THREE.Vector3.prototype.multiplyScalar;
    divideScalar = THREE.Vector3.prototype.divideScalar;

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

    unproject(camera) {
        const print = (m) => {
            return `${m[0]} ${m[1]} ${m[2]} ${m[3]}
                ${m[4]} ${m[5]} ${m[6]} ${m[7]}
                ${m[8]} ${m[9]} ${m[10]} ${m[11]}
                ${m[12]} ${m[13]} ${m[14]} ${m[15]}`;
        };
        // console.log(print(camera.matrixWorld.elements));
        // console.log(print(matrix.getInverse(camera.projectionMatrix).elements));
        matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
        return this.applyMatrix4(matrix);
    }

    applyMatrix4(m) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const e = m.elements;

        const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

        this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
        this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
        this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

        return this;
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
