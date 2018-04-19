var sphericalMercator = require('../Utility/SphericalMercator');
var Cartesian = require('../Math/Cartesian');

/**
 * Camera class
 * @alias Camera
 * @constructor
 * @extends THREE.PerspectiveCamera
 *
 * @param {Object} options
 * @param {Canvas} options.canvas - Canvas
 * @param {Map3D} options.map - Map
 */
function Camera (options) {
    if (!options) throw new Error('No option provided');
    if (!options.canvas) throw new Error('No options.canvas provided');

    THREE.PerspectiveCamera.call(this, 70, options.canvas.width / options.canvas.height, 1 / 99, 100000000000000);

    /**
     * @type {Map3D}
     */
    this._map = options.map;

    /**
     * @type {THREE.Vector3}
     */
    this.target = new THREE.Vector3();

    /**
     * @type {QtPositioning.coordinate}
     */
    this._targetCartographic = QtPositioning.coordinate();

    /**
     * @type {QtPositioning.coordinate}
     */
    this._positionCartographic = QtPositioning.coordinate();

    /**
     * @type {Cartesian[]}
     */
    this._culledGroundPlane = [new Cartesian(), new Cartesian(), new Cartesian(), new Cartesian()];

    /**
     * @type {boolean}
     */
    this.updatedLastFrame = false;

    /**
     * FIXME:
     * Debuging mesh
     */
    // var material = new THREE.MeshBasicMaterial({
    //     wireframe: true,
    //     // opacity: 0,
    //     color: new THREE.Color(0xff0000)
    // });
    // this.geometry = new THREE.Geometry();
    // this.geometry.vertices = [
    //     new THREE.Vector3(),
    //     new THREE.Vector3(),
    //     new THREE.Vector3(),
    //     new THREE.Vector3()
    // ];
    // this.geometry.faces = [
    //     new THREE.Face3(0, 1, 3),
    //     new THREE.Face3(1, 3, 2)
    // ];
    // this.geometry.computeFaceNormals();
    // var mesh = new THREE.Mesh(this.geometry, material);

    // this._map.scene.add(mesh);
}

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

/**
 *
 * @param {Object} position
 * @param {number} [position.x]
 * @param {number} [position.y]
 * @param {number} [position.z]
 */
Camera.prototype.setPosition = function (position) {
    if (!position) throw new Error('No position provided');
    // Partial set x, y, z of position
    this.position.x = position.x || this.position.x;
    this.position.y = position.y || this.position.y;
    this.position.z = position.z || this.position.z;

    sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);

    // sphericalMercator.PixelToCartesian(this.position, this._positionCartesian);

    this.updatedLastFrame = true;
};

var t = new THREE.Vector3();
var s = new THREE.Vector3();
var corner = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
Camera.prototype.update = function () {
    // Update Cartographic position
    sphericalMercator.PixelToCartographic(this.target, this._targetCartographic);

    t.addVectors(this.target, this.position);
    sphericalMercator.PixelToCartographic(t, this._positionCartographic);

    this.updatedLastFrame = true;

    // Calculate ray direction at 4 corners of screen
    var scale;
    for (var i = 0; i < 4; i++) {
        t.set(corner[i][0], corner[i][1], 0.5).unproject(this).sub(this.position).normalize();
        // Case corner of camrea to over horizontal line direction from camera y axis will be positive
        // It will not be able to project plane so will clip with -0
        if (t.y >= 0) {
            t.y = -0.00001;
        }

        scale = this.position.y / t.y;

        s.subVectors(this.position, t.multiplyScalar(scale));

        this._culledGroundPlane[i].set(s.x + this.target.x, 0, s.z + this.target.z);

        // FIXME: Debugging
        // this.geometry.vertices[i].set(s.x, 0, s.z);
    }

    // FIXME: Debugging
    // this.geometry.verticesNeedUpdate = true;
};

Object.defineProperties(Camera.prototype, {
    positionCartographic: {
        get: function () {
            return this._positionCartographic;
        }
    },
    targetCartographic: {
        get: function () {
            return this._targetCartographic;
        }
    },
    culledGroundPlane: {
        get: function () {
            return this._culledGroundPlane;
        }
    }
});

module.exports = Camera;
