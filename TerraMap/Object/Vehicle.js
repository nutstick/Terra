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
     * Position
     * @type {THREE.Vector3}
     * @private
     */
    this._position = new THREE.Vector3(0, 0, 0);

    // Initialize pin position
    if (options.position) {
        // Case position is a QtPositioning.coordiante
        if (options.position.longitude) {
            this._position = MapUtility.CartographicToPixel(options.position);
        } else {
            this._position = options.position.clone();
            // Default height is 10 meters
            this._position.y = options.height | MapUtility.tenMeters();
        }
    }

    /**
     * Pin's head geomtry
     * @type {THREE.CylinderGeometry}
     */
    this.headGeometry = new THREE.CylinderGeometry(3, 3, 8, 8, 1);
    // Recalculate centroid of mesh offset by 8
    for (var i = 0, len = this.headGeometry.vertices.length; i < len; i++) {
        this.headGeometry.vertices[i].y += 8;
    }

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
    this.lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.lineGeometry.vertices.push(new THREE.Vector3(0, 8, 0));
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
    this.head.position.copy(this._position);
    this.head.position.y += this._height;
    this.line.position.copy(this._position);
    this.line.geometry.vertices[1].y = this._height;
    this.line.geometry.verticesNeedUpdate = true;

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
    this.lastScale = undefined;
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
    scale: {
        get: function () {
            return this.lastScale;
        },
        set: function (scale) {
            if (this.lastScale === scale) return;

            this.lastScale = scale;

            this.head.scale.set(scale, scale, scale);
            // FIXME: computeBoundingSphere
            // this.head.geometry.computeBoundingSphere();
            // this.arrow.scale.set(scale, scale, scale);
            // this.arrow.geometry.computeBoundingSphere();
        }
    }
});

module.exports = Vehicle;
