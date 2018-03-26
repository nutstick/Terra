var MapSettings = require('../Core/MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator').sphericalMercator;

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
}

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

Camera.prototype.setPosition = function(position) {
    this._positionCartographic = sphericalMercator.PixelToCartographic(position);
    this._positionCartesian = sphericalMercator.CartographicToCartesian(this._positionCartographic);
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
