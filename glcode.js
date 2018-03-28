Qt.include('./three.js');
Qt.include("/lib/OrbitControls.js");

Qt.include('./require.js');
var Map = require('./TerraMap/Core/Map');
var Scene3D = require('./TerraMap/SceneMode/Scene3D');

var map, renderer;
function initializeGL(canvas, eventSource) {
    renderer = new THREE.Canvas3DRenderer({ canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);

    map = new Map({
        mode: new Scene3D(),
        canvas: canvas,
        eventSource: eventSource,
        renderer: renderer
    });

    map.update();

    map.vehiclePosition = QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10);
}

function resizeGL(canvas) {
    map.resizeView(canvas);
}

function paintGL(canvas) {
    map.update();
    // Trigger debug update
    controlWindow.onMapUpdate();

    renderer.render(map.scene, map.camera);
}
