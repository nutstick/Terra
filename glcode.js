Qt.include("/Core/Map.js");
Qt.include("/SceneMode/Scene3D.js");

var map;
function initializeGL(canvas, eventSource) {
    map = new Map({
        mode: new Scene3D(),
        canvas: canvas,
        eventSource: eventSource,
        takeoffPoint: QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10)
    });

    map.update();
}

function resizeGL(canvas) {
    map.resizeView(canvas);
}

function paintGL(canvas) {
//    map.update();
    map._renderer.render(map.scene, map.camera);
}
