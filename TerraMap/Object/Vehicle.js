var MapSettings = require('../Core/MapSettings');
var MapUtility = require('../Utility/MapUtility');
var sphericalMercator = require('../Utility/SphericalMercator');
/**
 * Vehicle Class
 * @alias Vehicle
 * @constructor
 * @extends RenderingObject
 *
 * @param {Object} options
 * @param {Map} options.map - Map
 */
function Vehicle (options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');

    /**
     * Map
     * @type {Map}
     * @private
     */
    this._map = options.map;

    /**
     * Pin's head geomtry
     * @type {THREE.TetrahedronGeometry}
     */
    var headGeometry = new THREE.Geometry();

    var radius = 7.5;
    var x = radius * 2.0 / 3.0;
    var offset = 0; // radius / 3.0;

    headGeometry.vertices = [
        new THREE.Vector3(0.0, 0.0, 0.0 + offset),
        new THREE.Vector3(-x * Math.sqrt(3), x, x + offset),
        new THREE.Vector3(x * Math.sqrt(3), x, x + offset),
        new THREE.Vector3(0.0, x * 2.0 / 3.0, 0.0 + offset),
        new THREE.Vector3(0.0, 0.0, -2 * x + offset)
    ];
    headGeometry.faces = [
        new THREE.Face3(0, 2, 3),
        new THREE.Face3(0, 3, 1),
        new THREE.Face3(0, 4, 2),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(3, 4, 1),
        new THREE.Face3(3, 2, 4)
    ];
    headGeometry.computeFaceNormals();

    headGeometry.rotateX(10 / 180 * Math.PI);

    /**
     * Pin's head mesh
     * @type {THREE.Mesh}
     */
    this.head = new THREE.Mesh(
        headGeometry,
        new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true })
    );
    this.head.name = 'Head';
    this.head.pin = this;

    /**
     * Line between head and arrow geometry
     * @type {THREE.Geometry}
     */
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3());
    lineGeometry.vertices.push(this.head.position);
    /**
     * ine between head and arrow
     * @type {THREE.LineSegments}
     */
    this.line = new THREE.LineSegments(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
    );
    this.line.name = 'Line';

    /**
     * Pack of all mesh in pin (head, line, arrow)
     * @type {THREE.Group}
     */
    this.group = new THREE.Group();
    this.group.add(this.head);
    this.group.add(this.line);
    this.group.name = 'Vehicle';
    
    options.map.scene.add(this.group);

    // var box = new THREE.BoxHelper(this.group, 0xffff00);
    // options.map.scene.add(box);

    /**
     * Rendered Point at Ground
     * @type {THREE.Vector3}
     * @private
     */
    this._rGPosition = this.line.geometry.vertices[0];
    /**
     * Rendered Point
     * @type {THREE.Vector3}
     * @private
     */
    this._rPosition = this.head.position;

    // TODO: Can it be Carsetian
    /**
     * Position
     * @type {THREE.Vector3}
     * @private
     */
    this._position = new THREE.Vector3(0, 0, 0);

    /**
     * Head angle from North (0, -1, 0)
     * @type {number}
     * @private
     */
    this._headAngle = 0.0;

    // Initialize pin position
    this.position = options.position;

    /**
     * Scale
     * @type {number}
     */
    this.lastScale = 1.0;

    // Add Target Subscribe to this object
    options.map.addSubscribeObject(this);
}

/**
 * Free memory and remove vehicle from rendering
 */
Vehicle.prototype.dispose = function () {
    // https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js#L397
    this.group,remove(this.head);
    this.group,remove(this.line);

    this._map.scene.remove(this.group);

    this._map = undefined;
    this.group = undefined;

    this.head.geometry.dispose();
    this.head.material.dispose();
    this.head = undefined;

    this.line.geometry.dispose();
    this.line.material.dispose();
    this.line = undefined;

    this._rGPosition = undefined;
    this._rPosition = undefined;
    this._position = undefined;

    options.map.removeSubscribeObject(this);
}

Vehicle.prototype.updateTarget = function (target) {
    // Update rendering position
    this._rPosition.subVectors(this._position, target);
    // TODO: elevation projection instead of 0
    this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
    this.line.geometry.verticesNeedUpdate = true;
}

Object.defineProperties(Vehicle.prototype, {
    position: {
        get: function () {
            return this._position;
        },
        set: function (position) {
            if (!position) {
                this._position.y = MapUtility.tenMeters();
            } else {
                // Case position is a QtPositioning.coordiante
                if (position.longitude) {
                    this._position = MapUtility.CartographicToPixel(position);
                } else {
                    this._position.copy(position);
                    // Default height is 10 meters
                    this._position.y = this._position.y | MapUtility.tenMeters();
                }   
            }

            // Restrict position above ground only
            this._position.y = Math.max(this._position.y, 0);

            // Update rendering position
            // TODO: Is this._map needs
            this._rPosition.subVectors(this._position, this._map.camera.target);
            // TODO: elevation projection instead of 0
            this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);

            this.line.geometry.verticesNeedUpdate = true;
        }
    },
    /**
     * Gets cartographic coordinate.
     * @memberof Vehicle.prototype
     * @type {QtPositioning.coordinate}
     */
    coordinate: {
        get: function () {
            return MapUtility.PixelToCartographic(this._position);
        },
    },
    height: {
        get: function () {
            return this._position.y;
        },
        set: function (height) {
            this._position.y = height;
        }
    },
    /**
     * Head angle of Vehicle in degree clockwise
     * @memberof Vehicle.prototype
     *
     * @type {number}
     */
    headAngle: {
        get: function () {
            return -this._headAngle * 180 / Math.PI;
        },
        set: function (angle) {
            var angle_ = -angle * Math.PI / 180;
            this.head.geometry.rotateY(angle_ - this._headAngle);
            this._headAngle = angle_;
        }
    },
    scale: {
        get: function () {
            return this.lastScale;
        },
        set: function (scale) {
            if (this.lastScale === scale) return;

            this.head.geometry.scale(scale / this.lastScale, scale / this.lastScale, scale / this.lastScale);
            this.lastScale = scale;
        }
    }
});

module.exports = Vehicle;
