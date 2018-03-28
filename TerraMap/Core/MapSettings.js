/**
 * @typedef {Object} MapSettings
 * @property {number} basePlaneDimension
 * @property {number} cameraDistance
 * @property {boolean} debug
 * @property {boolean} optimize
 */

/** @type {MapSettings} */
var MapSettings = {
    basePlaneDimension: Math.pow(2, 16),
    cameraDistance: 12000,
    debug: true,
    optimize: true
};

module.exports = MapSettings;