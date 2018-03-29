var MapSettings = require('../Core/MapSettings');
var MapUtility = require('../Utility/MapUtility');
var sphericalMercator = require('../Utility/SphericalMercator');
/**
 * Vehicle Class
 * @alias Vehicle
 * @constructor
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
     * Point at Ground
     * @type {THREE.Vector3}
     * @private
     */
    this._groundPosition = new THREE.Vector3(0, 0, 0);

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
    if (options.position) {
        // Case position is a QtPositioning.coordiante
        if (options.position.longitude) {
            this._position = MapUtility.CartographicToPixel(options.position);
            // Set ground TODO: y as 0
            this._groundPosition.x = this._position.x;
            this._groundPosition.y = 0;
            this._groundPosition.z = this._position.z;
        } else {
            this._position = options.position.clone();
            // Default height is 10 meters
            this._position.y = options.height | MapUtility.tenMeters();

            // Set ground TODO: y as 0
            this._groundPosition.x = this._position.x;
            this._groundPosition.y = 0;
            this._groundPosition.z = this._position.z;
        }
    }

    /**
     * Pin's head geomtry
     * @type {THREE.TetrahedronGeometry}
     */
    this.headGeometry = new THREE.Geometry();

    var radius = 7.5;
    var x = radius * 2.0 / 3.0;
    var offset = radius / 3.0;

    this.headGeometry.vertices = [
        new THREE.Vector3(0.0, 0.0, 0.0 + offset),
        new THREE.Vector3(-x * Math.sqrt(3), x, x + offset),
        new THREE.Vector3(x * Math.sqrt(3), x, x + offset),
        new THREE.Vector3(0.0, x * 2.0 / 3.0, 0.0 + offset),
        new THREE.Vector3(0.0, 0.0, -2 * x + offset)
    ];
    this.headGeometry.faces = [
        new THREE.Face3(0, 2, 3),
        new THREE.Face3(0, 3, 1),
        new THREE.Face3(0, 4, 2),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(3, 4, 1),
        new THREE.Face3(3, 2, 4)
    ];
    this.headGeometry.computeFaceNormals();

    this.headGeometry.rotateX(20 / 180 * Math.PI);

    // Recalculate centroid of mesh offset by 8
    // for (var i = 0, len = this.headGeometry.vertices.length; i < len; i++) {
    //     this.headGeometry.vertices[i].y += 8;
    // }

    /**
     * Pin's head mesh
     * @type {THREE.Mesh}
     */
    this.head = new THREE.Mesh(
        this.headGeometry,
        new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true })
    );
    this.head.name = 'Head';
    this.head.pin = this;

    /**
     * Line between head and arrow geometry
     * @type {THREE.Geometry}
     */
    this.lineGeometry = new THREE.Geometry();
    this.lineGeometry.vertices.push(this._groundPosition);
    this.lineGeometry.vertices.push(this._position);
    /**
     * ine between head and arrow
     * @type {THREE.LineSegments}
     */
    this.line = new THREE.LineSegments(
        this.lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
    );
    this.line.name = 'Line';

    // Update position
    this.head.position = this._position;

    /**
     * Pack of all mesh in pin (head, line, arrow)
     * @type {THREE.Group}
     */
    this.group = new THREE.Group();
    this.group.add(this.head);
    this.group.add(this.line);

    options.map.scene.add(this.group);

    /**
     * Scale
     * @type {number}
     */
    this.lastScale = 1.0;
}

Object.defineProperties(Vehicle.prototype, {
    position: {
        get: function () {
            return this._position;
        },
        set: function (position) {
            // Case position is a QtPositioning.coordiante
            if (position.longitude) {
                this._position = MapUtility.CartographicToPixel(position);
            } else {
                this._position.copy(position);
                // Default height is 10 meters
                this._position.y = this._position.y | MapUtility.tenMeters();
            }

            // Update Head position
            this.head.position.copy(this._position);
            // Update arrow position
            // this.arrow.position.copy(this.position);
            // Update Line position
            this.line.position.copy(MapUtility.ground(this._position));
            this.line.geometry.vertices[1].y = this._position.y - this.line.position.y;
            this.line.geometry.verticesNeedUpdate = true;
        }
    },
    coordinate: {
        get: function () {
            return MapUtility.PixelToCartographic(this._position);
        },
    },
    height: {
        get: function () {
            return this._height;
        },
        set: function (height) {
            this._height = height;
        }
    },
    meterHeight: {
        get: function () {
            var meterPerPixel = sphericalMercator.mPerPixel(0);
            return this._height / meterPerPixel;
        },
        set: function (height) {
            var meterPerPixel = sphericalMercator.mPerPixel(0);
            this._height = height * meterPerPixel;
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
            this.headGeometry.rotateY(angle_ - this._headAngle);
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
