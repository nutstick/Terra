Qt.include('/Core/MapSettings.js');
Qt.include('/Utility/SphericalMercator.js');

var defaultSphericalMercator = new SphericalMercator({
    size: MapSettings.basePlaneDimension
});
var meterPerPixel = defaultSphericalMercator.mPerPixel(0);

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
}

MapUtility.tenMeters = function(latitude) {
    return 10 / (latitude ? defaultSphericalMercator.mPerPixel(latitude) : meterPerPixel);
}

MapUtility.GeoToLtp = function(coordinate) {
    var _eterPerPixel = defaultSphericalMercator.mPerPixel(coordinate.latitude);
    var px = defaultSphericalMercator.px(coordinate, 0);

    return new THREE.Vector3(
        px.x - MapSettings.basePlaneDimension / 2,
        coordinate.altitude / _eterPerPixel,
        px.y - MapSettings.basePlaneDimension / 2
    );
}

MapUtility.LtpToGeo = function(position) {
    var ll = defaultSphericalMercator.ll([position.x + MapSettings.basePlaneDimension / 2,
                                          position.z + MapSettings.basePlaneDimension / 2], 0);
    var meterPerPixel = defaultSphericalMercator.mPerPixel(ll.latitude);
    ll.altitude = position.y * meterPerPixel;
    
    return ll;
}
