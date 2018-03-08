Qt.include("/Core/Map.js");
Qt.include("/SceneMode/Scene3D.js");

var map;
function initializeGL(canvas, eventSource) {
    map = new Map({
        mode: new Scene3D(),
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
}
