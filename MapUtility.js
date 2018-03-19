Qt.include('/Core/MapSettings.js');
Qt.include('/Utility/SphericalMercator.js');

var defaultSphericalMercator = new SphericalMercator({
    size: MapSettings.basePlaneDimension
});
var meterPerPixel = defaultSphericalMercator.mPerPixel(0);

/**
 * @class MapUtility
 */
var MapUtility = {};

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
    // TODO:
    // var ll = defaultSphericalMercator.ll(position, 0);
}
