Qt.include("/Core/Map.js");

//var include = {
//    init: false,
//    mapbox: false,
//}

///* SphericalMercator */
//Qt.include("sm.js")
///* Mapbox */
//Qt.include("https://api.tiles.mapbox.com/mapbox.js/v2.1.9/mapbox.js", function() {
//    include.mapbox = true;
//});
var map;
function initializeGL(canvas, eventSource) {
    map = new Map({
        canvas: canvas,
        eventSource: eventSource
    });

    map.update();
}

function resizeGL(canvas) {
    map.resizeView(canvas);
}

function paintGL(canvas) {
//    map.update();
    map._renderer.render(map.scene, map.camera);

    map.quadTree._textureGenerator.load();
}
