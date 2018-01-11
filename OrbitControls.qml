import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Input 2.0
import Qt3D.Logic 2.0
import QtQml 2.2

Entity {
    id: root
    property Camera camera
    property vector3d target: Qt.vector3d()

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    property real minDistance: 0.0
    property real maxDistance: 12000.0

    // Limits to how far you can zoom in and out ( OrthographicCamera only )
    property real minZoom: 0
    property real maxZoom: Infinity

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    property real minPolarAngle: 0
    property real maxPolarAngle: 0.2 * Math.PI

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    property real minAzimuthAngle: -Infinity
    property real maxAzimuthAngle: Infinity

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    property bool enableDamping: true
    property real dampingFactor: 0.75

    property bool enableZoom: false
    property bool enableRotate: false
    property bool enablePan: false
    property bool enableKeys: false

    // track moving
    property real lastMove: Date.now()
    property bool needUpdate: false

    /* Internals */
    property real EPS: 0.000001
    property real theta
    property real phi

    property real phiDelta: 0
    property real thetaDelta: 0
    property real scale: 1
    property vector3d panOffset: Qt.vector3d()
    property bool zoomChanged: false

    property Compass compass: compass

    function getPolarAngle() {
        return phi;
    }

    function getAzimuthalAngle() {
        return theta;
    }

    function rotateLeft(angle) {
        thetaDelta -= angle;
        compass.update();
    }

    function rotateUp(angle) {
        phiDelta -= angle;
        compass.update();
    }

    function panLeft(distance) {
        var v = Qt.vector3d();
        // TODO:
        console.log(camera.transform);
        var te = camera.transform.matrix.elements;

        // get X column of matrix
        v.set( te[ 0 ], te[ 1 ], te[ 2 ] );
        v.multiplyScalar( - distance );

        panOffset.add( v );
    }

    function panUp(distance) {
        var v = Qt.vector3d();
        // TODO:

        var te = camera.transform.matrix.elements;

        // get Y column of matrix
        v.set( te[ 4 ], /*te[ 5 ]*/ 0, te[ 6 ] );
        v.multiplyScalar( distance );

        panOffset.add( v );
    }

    function pan(deltaX, deltaY, screenWidth, screenHeight) {
        console.log('pan', camera);

    }

    function update() {
        var offset = Qt.vector3d();

        var cos_theta = u.normalized().dotProduct(v.normalized());
        var angle = Math.acos(cos_theta);
        var w = u.crossProduct(v).normalized();

        var quat = Qt.quaternion(angle, w)
    }
}
