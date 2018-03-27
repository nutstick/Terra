var Cartesian = require('./Cartesian');

function initialize(ellipsoid, x, y, z) {
    x = x || 0.0;
    y = y || 0.0;
    z = z || 0.0;

    ellipsoid._radii = new Cartesian({ x: x, y: y, z: z });

    ellipsoid._radiiSquared = new Cartesian({ x: x * x, y: y * y, z: z * z });

    ellipsoid._radiiToTheFourth = new Cartesian({ x: x * x * x * x, y: y * y * y * y, z: z * z * z * z });

    ellipsoid._oneOverRadii = new Cartesian({ x: x === 0.0 ? 0.0 : 1.0 / x,
                                        y: y === 0.0 ? 0.0 : 1.0 / y,
                                        z: z === 0.0 ? 0.0 : 1.0 / z });

    ellipsoid._oneOverRadiiSquared = new Cartesian({ x: x === 0.0 ? 0.0 : 1.0 / (x * x),
                                               y: y === 0.0 ? 0.0 : 1.0 / (y * y),
                                               z: z === 0.0 ? 0.0 : 1.0 / (z * z) });

    ellipsoid._minimumRadius = Math.min(x, y, z);

    ellipsoid._maximumRadius = Math.max(x, y, z);

    // ellipsoid._centerToleranceSquared = CesiumMath.EPSILON1;

    if (ellipsoid._radiiSquared.z !== 0) {
        ellipsoid._squaredXOverSquaredZ = ellipsoid._radiiSquared.x / ellipsoid._radiiSquared.z;
    }
}

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
function Ellipsoid(x, y, z) {
    this._radii = undefined;
    this._radiiSquared = undefined;
    this._radiiToTheFourth = undefined;
    this._oneOverRadii = undefined;
    this._oneOverRadiiSquared = undefined;
    this._minimumRadius = undefined;
    this._maximumRadius = undefined;
    this._centerToleranceSquared = undefined;
    this._squaredXOverSquaredZ = undefined;

    initialize(this, x, y, z);
}

Object.defineProperties(Ellipsoid.prototype, {
    /**
     * Gets the radii of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Cartesian3}
     * @readonly
     */
    radii : {
        get: function() {
            return this._radii;
        }
    },
    /**
     * Gets the squared radii of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Cartesian3}
     * @readonly
     */
    radiiSquared : {
        get : function() {
            return this._radiiSquared;
        }
    },
    /**
     * Gets the radii of the ellipsoid raise to the fourth power.
     * @memberof Ellipsoid.prototype
     * @type {Cartesian3}
     * @readonly
     */
    radiiToTheFourth : {
        get : function() {
            return this._radiiToTheFourth;
        }
    },
    /**
     * Gets one over the radii of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Cartesian3}
     * @readonly
     */
    oneOverRadii : {
        get : function() {
            return this._oneOverRadii;
        }
    },
    /**
     * Gets one over the squared radii of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Cartesian3}
     * @readonly
     */
    oneOverRadiiSquared : {
        get : function() {
            return this._oneOverRadiiSquared;
        }
    },
    /**
     * Gets the minimum radius of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Number}
     * @readonly
     */
    minimumRadius : {
        get : function() {
            return this._minimumRadius;
        }
    },
    /**
     * Gets the maximum radius of the ellipsoid.
     * @memberof Ellipsoid.prototype
     * @type {Number}
     * @readonly
     */
    maximumRadius : {
        get : function() {
            return this._maximumRadius;
        }
    }
});

Ellipsoid.WGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);

module.exports = Ellipsoid;