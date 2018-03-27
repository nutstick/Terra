var MapSettings = require('../Core/MapSettings');
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
 */
function Camera(options) {
    if (!options) throw new Error('No option provided');
    if (!options.canvas) throw new Error('No options.canvas provided');
    
    THREE.PerspectiveCamera.call(this, 70, options.canvas.width / options.canvas.height, 1/99, 100000000000000);

    /**
     * @type {QtPositioning.coordinate}
     */
    this._positionCartographic = QtPositioning.coordinate();

    /**
     * @type {Cartesian}
     */
    this._positionCartesian = new Cartesian();
}

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

/**
 * 
 * @param {Object} position 
 * @param {number} [position.x]
 * @param {number} [position.y]
 * @param {number} [position.z]
 */
Camera.prototype.setPosition = function(position) {
    if (!position) throw new Error('No position provided');
    // Partial set x, y, z of position
    this.position.x = position.x || this.position.x;
    this.position.y = position.y || this.position.y;
    this.position.z = position.z || this.position.z;

    sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);

    sphericalMercator.CartographicToCartesian(this._positionCartographic, this._positionCartesian);
};
Camera.prototype.updatePosition = function() {
    sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);

    sphericalMercator.CartographicToCartesian(this._positionCartographic, this._positionCartesian);
};

Object.defineProperties(Camera.prototype, {
    positionCartographic: {
        get: function() {
            return this._positionCartographic;
        }
    },
    positionCartesian: {
        get: function() {
            return this._positionCartesian;
        }
    }
});

module.exports = Camera;
