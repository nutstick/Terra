var MapSettings = require('../Core/MapSettings');
var MapUtility = require('../Utility/MapUtility');
var sphericalMercator = require('../Utility/SphericalMercator');

/**
 * Pin Class
 * @alias Pin
 * @constructor
 * @extends RenderingObject
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
     * Pin's head geomtry
     * @type {THREE.CylinderGeometry}
     */
    var headGeometry = new THREE.CylinderGeometry(3, 3, 8, 8, 1);
    // Recalculate centroid of mesh offset by 8
    for (var i = 0, len = headGeometry.vertices.length; i < len; i++) {
        headGeometry.vertices[i].y += 8;
    }

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
     * Pin's arrow geometry
     * @type {THREE.CylinderGeometry}
     */
    var arrowGeometry = new THREE.CylinderGeometry(4, 0, 6, 6, 1);
    // Recalculate centroid
    for (var i_ = 0, len_ = arrowGeometry.vertices.length; i_ < len_; i_++) {
        arrowGeometry.vertices[i_].y += 3;
    }
    arrowGeometry.computeBoundingSphere();
    /**
     * Pin's arrow
     * @type {THREE.Mesh}
     */
    this.arrow = new THREE.Mesh(
        arrowGeometry,
        new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true })
    );
    this.arrow.name = 'Arrow';
    this.arrow.pin = this;

    /**
     * Line between head and arrow geometry
     * @type {THREE.Geometry}
     */
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(this.arrow.position);
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
    this.group.add(this.arrow);
    this.group.name = 'Pin';

    // TODO: Map should have addRenderingObject function instead of direct access to scene
    this._mission._map.scene.add(this.group);

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

    // Initialize pin position
    this.position = options.position;

    /**
     * Last move scale of pin
     * @type {number}
     */
    // TODO: lastScale inside mission or map so that no need to calculate on all pin
    this.lastScale = 1.0;

    // Add Target Subscribe to this object
    this._mission._map.addSubscribeObject(this);
}

/**
 * Free memory and remove pin from rendering
 */
Pin.prototype.dispose = function () {
    this.group,remove(this.head);
    this.group,remove(this.line);

    this._mission._map.scene.remove(this.group);

    this._mission = undefined;
    this.group = undefined;

    // Clear Meshes
    this.head.geometry.dispose();
    this.head.material.dispose();
    this.head = undefined;

    this.line.geometry.dispose();
    this.line.material.dispose();
    this.line = undefined;

    this.arrow.geometry.dispose();
    this.arrow.material.dispose();
    this.arrow = undefined;

    this._rGPosition = undefined;
    this._rPosition = undefined;
    this._position = undefined;

    this._mission._map.removeSubscribeObject(this);

    console.log(this)
};


Pin.prototype.updateTarget = function (target) {
    // Update rendering position
    this._rPosition.subVectors(this._position, target);
    // TODO: elevation projection instead of 0
    this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
    this.line.geometry.verticesNeedUpdate = true;
}

/**
 * Moving head with offset height
 * @param {number} delta
 */
// Pin.prototype.offsetHeight = function (delta) {
//     this.height += delta;
//     // Update Head position
//     this.head.position.copy(this.position);
//     this.head.position.y += this.height;
//     // Update Line position
//     this.line.geometry.vertices[1].y = this.height;
//     this.line.geometry.verticesNeedUpdate = true;

//     // Update line inbetween pins
//     this._mission.updatePin(this._index);
// };

// Pin.prototype.setPosition = function (position) {
//     this.position.copy(position);

//     // Update Head position
//     this.head.position.copy(this.position);
//     this.head.position.y += this.height;
//     // Update arrow position
//     this.arrow.position.copy(this.position);
//     // Update Line position
//     this.line.position.copy(this.position);

//     // TODO: line between pin update
//     this._mission.updatePin(this._index);
// };

Object.defineProperties(Pin.prototype, {
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
            // Update rendering position
            // TODO: Is this._map needs
            this._rPosition.subVectors(this._position, this._mission._map.camera.target);
            // TODO: elevation projection instead of 0
            this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);

            this.line.geometry.verticesNeedUpdate = true;
        }
    },
    groundPosition: {
        get: function () {
            // TODO: y
            return new THREE.Vector3(this._position.x, 0, this._position.y);
        },
        set: function (position) {
            // Case position is a QtPositioning.coordiante
            if (position.longitude) {
                var p = MapUtility.CartographicToPixel(position);

                this._position.x = p.x;
                this._position.z = p.z;
            } else {
                this._position.x = position.x;
                this._position.z = position.z;
            }

            this.updateTarget(this._mission._map.camera.target);
        }
    },
    /**
     * Gets cartographic coordinate.
     * @memberof Pin.prototype
     * @type {QtPositioning.coordinate}
     */
    coordinate: {
        get: function () {
            return MapUtility.PixelToCartographic(this._position);
        }
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
     * Gets rendering scale.
     * @memberof Pin.prototype
     * @type {number}
     */
    scale: {
        get: function () {
            return this.lastScale;
        },
        set: function (scale) {
            if (this.lastScale === scale) return;

            this.head.geometry.scale(scale / this.lastScale, scale / this.lastScale, scale / this.lastScale);
            this.arrow.geometry.scale(scale / this.lastScale, scale / this.lastScale, scale / this.lastScale);
            this.lastScale = scale;
        }
    }
});

module.exports = Pin;
