/**
 * Cartesian class
 * Coordinate system on metres base [x, y, hegiht]
 * @alias Cartesian
 * @constructor
 *
 * @param {Object} options
 * @param {number} [options.x=0]
 * @param {number} [options.y=0]
 * @param {number} [options.z] - Height from ground
 * @param {number} [options.height=0] - Height from ground
 */
function Cartesian (options) {
    options = options || {};
    /**
     * @type {number}
     */
    this._x = options.x || 0;

    /**
     * @type {number}
     */
    this._y = options.y || 0;

    /**
     * @type {number}
     */
    this._z = options.height || options.z || 0;
}

Cartesian.prototype = Object.create(THREE.Vector3.prototype);

Object.defineProperties(Cartesian.prototype, {
    /**
     * @memberof Cartesian.prototype
     *
     * @type {number}
     */
    x: {
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
        }
    },
    /**
     * @memberof Cartesian.prototype
     *
     * @type {number}
     */
    y: {
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
        }
    },
    /**
     * @memberof Cartesian.prototype
     *
     * @type {number}
     */
    height: {
        get: function () {
            return this._z;
        },
        set: function (z) {
            this._z = z;
        }
    },
    /**
     * @memberof Cartesian.prototype
     *
     * @type {number}
     */
    z: {
        get: function () {
            return this._z;
        },
        set: function (z) {
            this._z = z;
        }
    }
});

module.exports = Cartesian;
