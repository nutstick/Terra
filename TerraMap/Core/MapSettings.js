/**
 * @typedef {Object} MapSettings
 * @property {number} basePlaneDimension
 * @property {number} cameraDistance
 * @property {boolean} debug
 * @property {boolean} optimize
 */

/** @type {MapSettings} */
var MapSettings = {
    basePlaneDimension: 20037508.342789244 * 2, // Math.pow(2, 16),
    cameraDistance: 12000000, // * Math.pow(2, 16),
    maxCameraDistance: 12000000, // * Math.pow(2, 24),
    debug: true,
    optimize: true
};

module.exports = MapSettings;
