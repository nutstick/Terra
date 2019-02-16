Qt.include('./three.js');
var Map3D, Scene2D, ready = false;

// Qt.include('https://storage.googleapis.com/terra-iife/terra.iife.js', function () {
Qt.include('./dist/terra.iife.js', function () {
    Map3D = terra.Map3D;
    Scene2D = terra.Scene2D;
    ready = true;
});

var map, renderer;
function initializeGL (canvas, context2d, eventSource) {
    if (!ready) return false
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

    map.setView(QtPositioning.coordinate(13.73805313416508, 100.5313363143085), 13);
}

function paintGL (canvas, context2d) {
    map.update();
    renderer.render(map.scene, map.camera);
}

function resizeGL (canvas, context2d) {
    map.resizeView(canvas);
}
