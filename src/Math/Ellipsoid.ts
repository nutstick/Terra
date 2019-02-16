import { Cartesian } from './Cartesian';
import { EPSILON1 } from './Constants';

/**
 * A quadratic surface defined in Cartesian coordinates by the equation
 * <code>(x / a)^2 + (y / b)^2 + (z / c)^2 = 1</code>.  Primarily used
 * by Cesium to represent the shape of planetary bodies.
 *
 * Rather than constructing this object directly, one of the provided
 * constants is normally used.
 * @alias Ellipsoid
 * @constructor
 *
 * @param {Number} [x=0] The radius in the x direction.
 * @param {Number} [y=0] The radius in the y direction.
 * @param {Number} [z=0] The radius in the z direction.
 *
 * @exception {DeveloperError} All radii components must be greater than or equal to zero.
 *
 * @see Ellipsoid.fromCartesian3
 * @see Ellipsoid.WGS84
 * @see Ellipsoid.UNIT_SPHERE
 */
export class Ellipsoid {
    _radii: Cartesian;
    _radiiSquared: Cartesian;
    _radiiToTheFourth: Cartesian;
    _oneOverRadii: Cartesian;
    _oneOverRadiiSquared: Cartesian;
    _minimumRadius: number;
    _maximumRadius: number;
    _centerToleranceSquared: number;
    _squaredXOverSquaredZ: number;

    constructor(x, y, z) {
        x = x || 0.0;
        y = y || 0.0;
        z = z || 0.0;
    
        this._radii = new Cartesian(x, y, z);
    
        this._radiiSquared = new Cartesian(x * x, y * y, z * z);
    
        this._radiiToTheFourth = new Cartesian(x * x * x * x, y * y * y * y, z * z * z * z);
    
        this._oneOverRadii = new Cartesian(
            x === 0.0 ? 0.0 : 1.0 / x,
            y === 0.0 ? 0.0 : 1.0 / y,
            z === 0.0 ? 0.0 : 1.0 / z,
        );
    
        this._oneOverRadiiSquared = new Cartesian(
            x === 0.0 ? 0.0 : 1.0 / (x * x),
            y === 0.0 ? 0.0 : 1.0 / (y * y),
            z === 0.0 ? 0.0 : 1.0 / (z * z),
        );
    
        this._minimumRadius = Math.min(x, y, z);
    
        this._maximumRadius = Math.max(x, y, z);
    
        this._centerToleranceSquared = EPSILON1;
    
        if (this._radiiSquared.z !== 0) {
            this._squaredXOverSquaredZ = this._radiiSquared.x / this._radiiSquared.z;
        }
    }

    get radii() {
        return this._radii;
    }

    get radiiSquared() {
        return this._radiiSquared;
    }
    get radiiToTheFourth() {
        return this._radiiToTheFourth;
    }
    get oneOverRadii() {
        return this._oneOverRadii;
    }
    get oneOverRadiiSquared() {
        return this._oneOverRadiiSquared;
    }
    get minimumRadius() {
        return this._minimumRadius;
    }
    get maximumRadius() {
        return this._maximumRadius;
    }
    get a() {
        return Math.PI * this._maximumRadius;
    }

    static WGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);

    static UNIT_SPHERE  = new Ellipsoid(1.0, 1.0, 1.0);
}
