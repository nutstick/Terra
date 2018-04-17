var MapSettings = require('../Core/MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator');

var meterPerPixel = sphericalMercator.mPerPixel(0);

/**
 * MapUtility
 * @type {Object}
 */
var MapUtility = {};

/**
 * Project 3D point to ground
 * @param {THREE.Vector2} position 
 */
MapUtility.ground = function(position) {
    var _ = position.clone();
    // FIXME: ground = 0 by now
    _.y = 0;
    return _;
};

MapUtility.tenMeters = function(latitude) {
    return 10 / (latitude ? sphericalMercator.mPerPixel(latitude) : meterPerPixel);
};

MapUtility.CartographicToPixel = function(coordinate) {
    var _eterPerPixel = sphericalMercator.mPerPixel(coordinate.latitude);
    var px = sphericalMercator.px(coordinate, 0);

    return new THREE.Vector3(
        px.x - MapSettings.basePlaneDimension / 2,
        coordinate.altitude / _eterPerPixel,
        px.y - MapSettings.basePlaneDimension / 2
    );
};

MapUtility.PixelToCartographic = function(position) {
    var ll = sphericalMercator.ll([position.x + MapSettings.basePlaneDimension / 2,
                                          position.z + MapSettings.basePlaneDimension / 2], 0);
    var meterPerPixel = sphericalMercator.mPerPixel(ll.latitude);
    ll.altitude = position.y * meterPerPixel;
    
    return ll;
};

MapUtility.CartographicToCartesian = function(coordinate) {
    var latRadian = coordinate.latitude * DEG_TO_RAD;
    var lonRadian = coordinate.longitude * DEG_TO_RAD;
};

var screenPosition = new THREE.Vector2();
MapUtility.rayCasterFromScreen = function (primitive, x, y, picker) {
    screenPosition.set((x / primitive.canvas.width) * 2 - 1, -(y / primitive.canvas.height) * 2 + 1);
    picker.setFromCamera(screenPosition, primitive.camera);

    return picker;
}

module.exports = MapUtility;