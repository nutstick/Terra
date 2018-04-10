Qt.include('./three.js');

Qt.include('./require.js');
var Map3D = require('./TerraMap/Core/Map3D');
var Scene3D = require('./TerraMap/SceneMode/Scene3D');
var DebugScene3D = require('./TerraMap/SceneMode/DebugScene3D');


var map, renderer;
function initializeGL(canvas, eventSource) {
    renderer = new THREE.Canvas3DRenderer({ canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);

    map = new Map3D({
        mode: new Scene3D(),
        canvas: canvas,
        eventSource: eventSource,
        renderer: renderer
    });

    map.update();

    map.vehiclePosition = QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10);

    map.setView(QtPositioning.coordinate(13.73805313416508, 100.53133631430856), 14);
}

function resizeGL(canvas) {
    map.resizeView(canvas);
}

function paintGL(canvas) {
    map.update();

    renderer.render(map.scene, map.camera);
}
