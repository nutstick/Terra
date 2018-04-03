var sphericalMercator = require('../Utility/SphericalMercator');
var Cartesian = require('../Math/Cartesian');

/**
 * Camera class
 * @alias Camera
 * @constructor
 * @extends {THREE.PerspectiveCamera}
 *
 * @param {Object} options
 * @param {Canvas} options.canvas - Canvas
 * @param {TerrainMap} options.map - Map
 */
function Camera (options) {
    if (!options) throw new Error('No option provided');
    if (!options.canvas) throw new Error('No options.canvas provided');

    THREE.PerspectiveCamera.call(this, 70, options.canvas.width / options.canvas.height, 1 / 99, 100000000000000);

    /**
     * @type {THREE.Vector3}
     */
    this.target = new THREE.Vector3();

    /**
     * @type {QtPositioning.coordinate}
     */
    this._targetCartographic = QtPositioning.coordinate();

    /**
     * @type {Cartesian}
     */
    this._targetCartesian = new Cartesian();

    /**
     * @type {QtPositioning.coordinate}
     */
    this._positionCartographic = QtPositioning.coordinate();

    /**
     * @type {Cartesian}
     */
    this._positionCartesian = new Cartesian();

    this.frustum = new THREE.Frustum();

    /**
     * @type {boolean}
     */
    this.updatedLastFrame = false;
}

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

/**
 *
 * @param {Object} position
 * @param {number} [position.x]
 * @param {number} [position.y]
 * @param {number} [position.z]
 */
Camera.prototype.setPosition = function (position) {
    if (!position) throw new Error('No position provided');
    // Partial set x, y, z of position
    this.position.x = position.x || this.position.x;
    this.position.y = position.y || this.position.y;
    this.position.z = position.z || this.position.z;

    sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);

    sphericalMercator.PixelToCartesian(this.position, this._positionCartesian);

    this.updatedLastFrame = true;
};

var t = new THREE.Vector3();
Camera.prototype.update = function () {
    // Update Camera target position
    sphericalMercator.PixelToCartographic(this.target, this._targetCartographic);
    sphericalMercator.PixelToCartesian(this.target, this._targetCartesian);

    t.addVectors(this.target, this.position);
    sphericalMercator.PixelToCartographic(t, this._positionCartographic);
    sphericalMercator.PixelToCartesian(t, this._positionCartesian);

    var matrix = new THREE.Matrix4().multiplyMatrices(this.projectionMatrix, this.matrixWorldInverse);
    this.frustum.setFromMatrix(matrix);

    this.updatedLastFrame = true;
};

Object.defineProperties(Camera.prototype, {
    positionCartographic: {
        get: function () {
            return this._positionCartographic;
        }
    },
    positionCartesian: {
        get: function () {
            return this._positionCartesian;
        }
    },
    targetCartographic: {
        get: function () {
            return this._targetCartographic;
        }
    },
    targetCartesian: {
        get: function () {
            return this._targetCartesian;
        }
    }
});

module.exports = Camera;
