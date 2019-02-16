import * as THREE from 'three';
import { Ellipsoid } from './Ellipsoid';

export interface CartesianOptions {
    x?: number;
    y?: number;
    z?: number;
    height?: number;
}

export class Cartesian extends THREE.Vector3 {
    static ZERO = new Cartesian(0, 0, 0);

    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(x, y, z);
    }

    static midpoint(a: Cartesian, b: Cartesian, result: Cartesian) {
        result.x = (a.x + b.x) / 2;
        result.y = (a.y + b.y) / 2;
        result.z = (a.z + b.z) / 2;
        return result;
    }
    
    static fromCartographic(longitude: number, latitude: number, height: number = 0, ellipsoid?: Ellipsoid, result?: Cartesian) {
        const radiiSquared = ellipsoid ? ellipsoid.radiiSquared : wgs84RadiiSquared;

        const cosLatitude = Math.cos(latitude);
        scratchN.x = cosLatitude * Math.cos(longitude);
        scratchN.y = cosLatitude * Math.sin(longitude);
        scratchN.z = Math.sin(latitude);
        scratchN.normalize();

        scratchK.multiplyVectors(radiiSquared, scratchN);
        const gamma = Math.sqrt(scratchN.dot(scratchK));
        scratchK.divideScalar(gamma);
        scratchN.multiplyScalar(height);

        if (!result) {
            result = new Cartesian();
        }
        return result.addVectors(scratchK, scratchN);
    };

    crossVectors(...args): Cartesian {
        return THREE.Vector3.prototype.crossVectors.call(this, ...args);
    }
    addVectors = THREE.Vector3.prototype.addVectors;
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }
    normalize = THREE.Vector3.prototype.normalize;
    length = THREE.Vector3.prototype.length;

    multiplyScalar = THREE.Vector3.prototype.multiplyScalar;
    multiplyVectors = THREE.Vector3.prototype.multiplyVectors;

    divideScalar = THREE.Vector3.prototype.divideScalar;

    copy(other: Cartesian) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }

    get height() { return this.y; }
    set height(height) { this.y = height; }
}

const scratchN = new Cartesian();
const scratchK = new Cartesian();
const wgs84RadiiSquared = new Cartesian(6378137.0 * 6378137.0, 6378137.0 * 6378137.0, 6356752.3142451793 * 6356752.3142451793);
