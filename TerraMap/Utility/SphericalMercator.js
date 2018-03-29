/* eslint-disable camelcase */
var Ellipsoid = require('../Math/Ellipsoid');
var MapSettings = require('../Core/MapSettings');

/**
 * @typedef {Object} QtPositioning.coordinate
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} altitude
 */
/**
 * @typedef {Object} THREE.Vector3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
/**
 * @typedef {Object} THREE.Vector2
 * @property {number} x
 * @property {number} y
 */

/* Ellipsoid model constants (actual values here are for WGS84) */

var cache = {};
var EPSLN = 1.0e-10;
var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

/**
 * SphericalMercator class
 * @alias SphericalMercator
 * @constructor
 *
 * @param {Object} options
 * @param {number} options.size
 */
function SphericalMercator (options) {
    options = options || {};
    this.size = options.size || 256;
    if (!cache[this.size]) {
        var size = this.size;
        var c = cache[this.size] = {};
        c.Bc = [];
        c.Cc = [];
        c.zc = [];
        c.Ac = [];
        for (var d = 0; d < 30; ++d) {
            c.Bc.push(size / 360);
            c.Cc.push(size / (2 * Math.PI));
            c.zc.push(size / 2);
            c.Ac.push(size);
            size *= 2;
        }
    }
    this.Bc = cache[this.size].Bc;
    this.Cc = cache[this.size].Cc;
    this.zc = cache[this.size].zc;
    this.Ac = cache[this.size].Ac;

    this.meterPerPixel = this.mPerPixel(0);
}

SphericalMercator.prototype.mPerPixel = function (latitude) {
    return Math.abs(Ellipsoid.WGS84.maximumRadius * 2 * Math.PI * Math.cos(latitude * Math.PI / 180) / this.size);
};

/**
 * @param {QtPositioning.coordinate} ll
 * @param {number} zoom
 * @returns {THREE.Vector2}
 */
SphericalMercator.prototype.px = function (ll, zoom) {
    var d = this.zc[zoom];
    var f = Math.min(Math.max(Math.sin(D2R * ll.latitude), -0.9999), 0.9999);
    var x = (d + ll.longitude * this.Bc[zoom]);
    var y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]));
    if (x > this.Ac[zoom]) x = this.Ac[zoom];
    if (y > this.Ac[zoom]) y = this.Ac[zoom];
    // if (x < 0) x = 0;
    // if (y < 0) y = 0;
    return new THREE.Vector2(x, y);
};

SphericalMercator.prototype.ll = function (px, zoom) {
    var g = (px[1] - this.zc[zoom]) / (-this.Cc[zoom]);
    var lon = (px[0] - this.zc[zoom]) / this.Bc[zoom];
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);

    var ll = QtPositioning.coordinate();
    ll.longitude = lon;
    ll.latitude = lat;
    return ll;
};

/**
 * @param {THREE.Vector3} px
 * @param {QtPositioning.coordinate} cartographic
 */
SphericalMercator.prototype.PixelToCartographic = function (px, cartographic) {
    var g = (px.z + MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
    cartographic.longitude = Math.min(
        (px.x + MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0],
        180 - EPSLN
    );
    cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);

    var meterPerPixel = this.mPerPixel(cartographic.latitude);
    cartographic.altitude = px.y * meterPerPixel;
};

/**
 * @param {QtPositioning.coordinate} coordinate
 * @returns {THREE.Vector3}
 */
SphericalMercator.prototype.CartographicToPixel = function (coordinate, px) {
    var d = this.zc[0];
    var f = Math.min(Math.max(Math.sin(D2R * coordinate.latitude), -0.9999), 0.9999);
    var x = (d + coordinate.longitude * this.Bc[0]);
    var y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
    if (x > this.Ac[0]) x = this.Ac[0];
    if (y > this.Ac[0]) y = this.Ac[0];
    // if (x < 0) x = 0;
    // if (y < 0) y = 0;

    px.x = x - MapSettings.basePlaneDimension / 2;
    px.y = coordinate.altitude / this.mPerPixel(0);
    px.z = y - MapSettings.basePlaneDimension / 2;

    return px;
};

/**
 * Convert given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
 * @param {QtPositioning.coordinate} coordinate
 * @param {Cartesian} cartesian
 *
 * @return {Cartesian}
 */
SphericalMercator.prototype.CartographicToCartesian = function (cartographic, cartesian) {
    var longitude = cartographic.longitude;
    var latitude = cartographic.latitude;

    var mX = longitude * Ellipsoid.WGS84.a;
    var mY = Math.log(Math.tan((90 + latitude) * D2R / 2)) * R2D;

    mY = mY * Ellipsoid.WGS84.a / 180.0;

    cartesian.x = mX;
    cartesian.y = mY;

    cartesian.height = cartographic.altitude;

    return cartesian;
};

/**
 * @param {QtPositioning.coordinate} coordinate
 * @param {Cartesian} cartesian
 * @returns {Cartesian}
 */
SphericalMercator.prototype.PixelToCartesian = function (px, cartesian) {
    cartesian.x = px.x * this.meterPerPixel;
    cartesian.y = px.z * this.meterPerPixel;
    cartesian.z = px.y * this.meterPerPixel;

    return cartesian;
};

module.exports = new SphericalMercator({ size: MapSettings.basePlaneDimension });
