var MapSettings = require('../Core/MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator');

/**
 * Pin Class
 * @alias Pin
 * @constructor
 *
 * @param {Object} options
 * @param {Mission} options.mission
 * @param {number} options.index
 * @param {THREE.Vector2 | QtPositioning.coordinate} [options.position] - Initial position
 * @param {number} options.height
 */
function Pin (options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.mission === 'undefined') throw new Error('No options.mission provided');
    /**
     * @type {Mission} Parent mission
     * @private
     */
    this._mission = options.mission;

    if (typeof options.index === 'undefined') throw new Error('No options.index provided');
    /**
     * Index in mission
     * @type {number}
     * @private
     */
    this._index = options.index;

    /**
     * Position
     * @type {THREE.Vector3}
     */
    this.position = new THREE.Vector3(0, 0, 0);
    /**
     * Height
     * @type {number}
     */
    this.height = 0;

    // Initialize pin position
    if (options.position) {
        // Case position is a QtPositioning.coordiante
        if (options.position.longitude) {
            var px = sphericalMercator.px(options.position, 0);
            // FIXME: y = 0 in 2D map case
            px = {
                x: px.x - MapSettings.basePlaneDimension / 2,
                y: 0,
                z: px.y - MapSettings.basePlaneDimension / 2
            };
            var meterPerPixel = sphericalMercator.mPerPixel(options.position.latitude);

            this.position = px;
            this.height = options.position.altitude / meterPerPixel;
        } else {
            this.position = options.position.clone();
            // Default height is 10 meters
            this.height = options.height | 10 / sphericalMercator.mPerPixel(0);
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

    /**
     * Pin's arrow geometry
     * @type {THREE.CylinderGeometry}
     */
    this.arrowGeometry = new THREE.CylinderGeometry(4, 0, 6, 6, 1);
    // Recalculate centroid
    for (var i_ = 0, len_ = this.arrowGeometry.vertices.length; i_ < len_; i_++) {
        this.arrowGeometry.vertices[i_].y += 3;
    }
    this.arrowGeometry.computeBoundingSphere();
    /**
     * Pin's arrow
     * @type {THREE.Mesh}
     */
    this.arrow = new THREE.Mesh(
        this.arrowGeometry,
        new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true })
    );
    this.arrow.name = 'Arrow';
    this.arrow.pin = this;

    // Update position
    this.head.position.copy(this.position);
    this.head.position.y += this.height;
    this.arrow.position.copy(this.position);
    this.line.position.copy(this.position);
    this.line.geometry.vertices[1].y = this.height;
    this.line.geometry.verticesNeedUpdate = true;

    /**
     * Pack of all mesh in pin (head, line, arrow)
     * @type {THREE.Group}
     */
    this.group = new THREE.Group();
    this.group.add(this.head);
    this.group.add(this.line);
    this.group.add(this.arrow);

    // TODO: Map should have addRenderingObject function instead of direct access to scene
    this._mission._map.scene.add(this.group);

    /**
     * Last move scale of pin
     * @type {number}
     */
    // TODO: lastScale inside mission or map so that no need to calculate on all pin
    this.lastScale = undefined;
}

/**
 * Free memory and remove pin from rendering
 */
Pin.prototype.dispose = function () {
    this._mission._map.scene.remove(this.group);
    this.group = undefined;
    this._mission = undefined;

    this.position = undefined;

    // Clear Meshes
    this.head.geometry.dispose();
    this.head.material.dispose();
    this.headGeometry = undefined;
    this.head = undefined;

    this.line.geometry.dispose();
    this.line.material.dispose();
    this.lineGeometry = undefined;
    this.line = undefined;

    this.arrow.geometry.dispose();
    this.arrow.material.dispose();
    this.arrowGeometry = undefined;
    this.arrow = undefined;
};

/**
 * Moving head with offset height
 * @param {number} delta
 */
Pin.prototype.offsetHeight = function (delta) {
    this.height += delta;
    // Update Head position
    this.head.position.copy(this.position);
    this.head.position.y += this.height;
    // Update Line position
    this.line.geometry.vertices[1].y = this.height;
    this.line.geometry.verticesNeedUpdate = true;

    // Update line inbetween pins
    this._mission.updatePin(this._index);
};

Pin.prototype.setScale = function (scale) {
    if (this.lastScale === scale) return;

    this.lastScale = scale;

    this.head.scale.set(scale, scale, scale);
    this.head.geometry.computeBoundingSphere();
    this.arrow.scale.set(scale, scale, scale);
    this.head.geometry.computeBoundingSphere();
};

Pin.prototype.setPosition = function (position) {
    this.position.copy(position);

    // Update Head position
    this.head.position.copy(this.position);
    this.head.position.y += this.height;
    // Update arrow position
    this.arrow.position.copy(this.position);
    // Update Line position
    this.line.position.copy(this.position);

    // TODO: line between pin update
    this._mission.updatePin(this._index);
};

Object.defineProperties(Pin.prototype, {
    coordinate: {
        get: function () {
            var ll = sphericalMercator.ll([this.position.x + MapSettings.basePlaneDimension / 2,
                this.position.z + MapSettings.basePlaneDimension / 2], 0);
            var meterPerPixel = sphericalMercator.mPerPixel(ll.latitude);
            ll.altitude = this.height * meterPerPixel;

            return ll;
        }
    }
});

module.exports = Pin;
