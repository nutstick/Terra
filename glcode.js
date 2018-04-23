Qt.include('./three.js');
Qt.include('./dist/terra.iife.js');
var Map3D = terra.Map3D;
var Scene2D = terra.Scene2D;
var map, renderer;
function initializeGL (canvas, context2d, eventSource) {
    renderer = new THREE.Canvas3DRenderer({ canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);

    map = new Map3D({
        mode: new Scene2D(),
        canvas: canvas,
        eventSource: eventSource,
        renderer: renderer,
        context2d: context2d
    });

    map.update();

    map.vehiclePosition = QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10);

    map.setView(QtPositioning.coordinate(13.73805313416508, 100.53133631430856), 14);
}

function resizeGL (canvas, context2d) {
    map.resizeView(canvas);
}

function paintGL (canvas, context2d) {
    map.update();

    renderer.render(map.scene, map.camera);
}
