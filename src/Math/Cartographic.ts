import { Cartesian } from './Cartesian';
import { EPSILON1 } from './Constants';
import { Ellipsoid } from './Ellipsoid';
import { scaleToGeodeticSurface } from './scaleToGeodeticSurface';
import { sign } from './Utils';

const wgs84OneOverRadii = new Cartesian(
    1.0 / 6378137.0,
    1.0 / 6378137.0,
    1.0 / 6356752.3142451793,
);
const wgs84OneOverRadiiSquared = new Cartesian(
    1.0 / (6378137.0 * 6378137.0),
    1.0 / (6378137.0 * 6378137.0),
    1.0 / (6356752.3142451793 * 6356752.3142451793),
);
const wgs84CenterToleranceSquared = EPSILON1;

/**
 * Shared variables
 */
const cartesianToCartographicP = new Cartesian();
const cartesianToCartographicN = new Cartesian();
const cartesianToCartographicH = new Cartesian();

export class Cartographic {
    public static ZERO = Object.freeze(new Cartographic());

    public longitude: number = 0;
    public latitude: number = 0;
    public height: number = 0;

    constructor(
        longitude: number = 0,
        latitude: number = 0,
        height: number = 0,
    ) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.height = height;
    }

    public static fromCartesian(cartesian: Cartesian, ellipsoid: Ellipsoid, result?: Cartographic) {
        const oneOverRadii = ellipsoid ? ellipsoid.oneOverRadii : wgs84OneOverRadii;
        const oneOverRadiiSquared = ellipsoid ? ellipsoid.oneOverRadiiSquared : wgs84OneOverRadiiSquared;
        const centerToleranceSquared = ellipsoid ? ellipsoid._centerToleranceSquared : wgs84CenterToleranceSquared;

        const p = scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared, cartesianToCartographicP);

        if (!p) {
            return;
        }

        const n = cartesianToCartographicN.multiplyVectors(p, oneOverRadiiSquared);
        n.normalize();

        const h = cartesianToCartographicH.subVectors(cartesian, p);

        const longitude = Math.atan2(n.y, n.x);
        const latitude = Math.asin(n.z);
        const height = sign(h.dot(cartesian)) * h.length();

        if (result) {
            return new Cartographic(longitude, latitude, height);
        }
        result.longitude = longitude;
        result.latitude = latitude;
        result.height = height;
        return result;
    }

    public static toCartesian(cartographic: Cartographic, ellipsoid: Ellipsoid, result: Cartesian) {
        return Cartesian.fromCartographic(cartographic.longitude, cartographic.latitude, cartographic.height, ellipsoid, result);
    }

    public clone() {
        return new Cartographic(this.longitude, this.latitude, this.height);
    }

    public equals(v: this) {
		return v.longitude === this.longitude && v.latitude === this.latitude && v.height === this.height;
    }
    
    public equalsEpsilon(v: this, epsilon: number) {
        return (this === v) ||
            (v &&
            (Math.abs(this.longitude - v.longitude) <= epsilon) &&
            (Math.abs(this.latitude - v.latitude) <= epsilon) &&
            (Math.abs(this.height - v.height) <= epsilon));
    };

    public toString() {
        return '(' + this.longitude + ', ' + this.latitude + ', ' + this.height + ')';
    };
}