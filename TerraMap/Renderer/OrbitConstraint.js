var MapSettings = require('../Core/MapSettings');

var EPS = 0.000001;

/**
 * OrbitConstraint class
 * @alias OrbitConstraint
 * @constructor
 *
 * @param {TerrainMap} map
 * @param {Camera} camera
 * @param {number} targetDistance
 */
function OrbitConstraint (map, camera, targetDistance) {
    this.map = map;

    /**
     * @type Camera
     */
    this.camera = camera;

    /**
     * @type number
     */
    this.targetDistance = targetDistance;

    // "target" sets the location of focus, where the object orbits around
    // and where it pans with respect to.
    this.target = camera.target;

    // this.offset = new THREE.Vector3();

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = MapSettings.maxCameraDistance;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = 0.2 * Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = true;
    this.dampingFactor = 0.75;

    this.maxClickTimeInterval = 500;

    /// /////////
    // internals

    // Current position in spherical coordinate system.
    this.theta = 0.0;
    this.phi = 0.0;

    // Pending changes
    this.phiDelta = 0.0;
    this.thetaDelta = 0.0;
    this.scale = 1.0;

    this.panOffset = new THREE.Vector3();
    this.zoomChanged = false;

    this.lastPosition = new THREE.Vector3();
    this.lastQuaternion = new THREE.Quaternion();

    quat = quat.setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
    quatInverse = quat.clone().inverse();
};

OrbitConstraint.prototype.getPolarAngle = function () {
    return this.phi;
};

OrbitConstraint.prototype.getAzimuthalAngle = function () {
    return this.theta;
};

OrbitConstraint.prototype.rotateLeft = function (angle) {
    this.thetaDelta -= angle;
    // TODO:
    // compass.update();
};

OrbitConstraint.prototype.rotateUp = function (angle) {
    this.phiDelta -= angle;
    // TODO:
    // compass.update();
};

// pass in distance in world space to move left
var v = new THREE.Vector3();

OrbitConstraint.prototype.panLeft = function (distance) {
    var te = this.camera.matrix.elements;

    // get X column of matrix
    v.set(te[ 0 ], te[ 1 ], te[ 2 ]);
    v.multiplyScalar(-distance);

    this.panOffset.add(v);
};

// pass in distance in world space to move up
OrbitConstraint.prototype.panUp = function (distance) {
    var te = this.camera.matrix.elements;

    // get Y column of matrix
    v.set(te[ 4 ], /* te[ 5 ] */ 0, te[ 6 ]);
    v.multiplyScalar(distance);

    this.panOffset.add(v);
};

// pass in x,y of change desired in pixel space,
// right and down are positive
OrbitConstraint.prototype.pan = function (deltaX, deltaY, screenWidth, screenHeight) {
    // half of the fov is center to top of screen
    var t = this.targetDistance * Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

    // we actually don't use screenWidth, since perspective camera is fixed to screen height
    this.panLeft(2 * deltaX * t / screenHeight);
    this.panUp(2 * deltaY * t / screenHeight);
};

OrbitConstraint.prototype.dollyIn = function (dollyScale) {
    this.scale /= dollyScale;
};

OrbitConstraint.prototype.dollyOut = function (dollyScale) {
    this.scale *= dollyScale;
};

var zero = new THREE.Vector3();
// so camera.up is the orbit axis
var quat = new THREE.Quaternion();
var quatInverse = new THREE.Quaternion();

/**
 * Update camera constrain
 * @returns {boolean}
 */
OrbitConstraint.prototype.update = function () {
    var offset = this.camera.position;

    this.theta += this.thetaDelta;
    this.phi += this.phiDelta;
    this.targetDistance = this.targetDistance * this.scale;

    // Restrict theta to be between desired limits
    this.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.theta));

    // Restrict phi to be between desired limits
    this.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.phi));

    // Restrict phi to be betwee EPS and PI-EPS
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));

    // Restrict radius to be between desired limits
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));

    // Move target to panned location
    this.target.add(this.panOffset);

    offset.x = this.targetDistance * Math.sin(this.phi) * Math.sin(this.theta);
    offset.y = this.targetDistance * Math.cos(this.phi);
    offset.z = this.targetDistance * Math.sin(this.phi) * Math.cos(this.theta);

    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse);

    this.camera.lookAt(zero);

    // Update camera matrix
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);

    this.camera.update();

    if (this.enableDamping === true) {
        this.thetaDelta *= (1.0 - this.dampingFactor);
        this.phiDelta *= (1.0 - this.dampingFactor);
    } else {
        this.thetaDelta = 0.0;
        this.phiDelta = 0.0;
    }

    this.scale = 1.0;
    this.panOffset.set(0, 0, 0);

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    var t = new THREE.Vector3();
    if (this.lastPosition.distanceToSquared(t.addVectors(this.camera.position, this.camera.target)) > EPS ||
        8 * (1 - this.lastQuaternion.dot(this.camera.quaternion)) > EPS ||
        this.zoomChanged) {
        this.lastPosition.copy(t);
        this.lastQuaternion.copy(this.camera.quaternion);
        this.zoomChanged = false;

        if (this.map.quadTree) {
            this.map.quadTree.needUpdate = true;
        }

        return true;
    }

    return false;
};

module.exports = OrbitConstraint;
