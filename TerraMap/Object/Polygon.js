var Pin = require('./Pin');
var MapSettings = require('../Core/MapSettings');
var MapUtility = require('../Utility/MapUtility');
var sphericalMercator = require('../Utility/SphericalMercator');

/**
 * Polygon Class
 * @alias Polygon
 * @constructor
 *
 * @param {Object} options
 * @param {Map} options.map
 */
function Polygon (options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');
    /**
     *
     * @type {Map} Map
     * @private
     */
    this._map = options.map;

    /**
     * Pin point that define polyline direction
     * @type {Pin[]}
     */
    this.pins = [];

    /**
     * Array of List of coordination that is generated as grid
     * @type {QtPositioning.coordinate[][]}
     */
    this.grids = [];
    /**
     * Array of List of angle if generate using optimization grid
     * @type {number[]}
     */
    this.angles = [];

    /**
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this.lines = [];

    /**
     * Three.Line
     * @type {THREE.Group}
     */
    this.gridMesh = undefined;

    this.gridGenerateOffset = new THREE.Vector3();

    /**
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this._closeLine = undefined;

    this.debug = {
        updated: false
    };

    this._map.addSubscribeObject(this);

    /**
     * Controller
     */
    /**
     * Set to false to disable marker modifiered
     * @type {bool}
     */
    this.enableMoveMarker = true;

    this.activePin = undefined;
}

Polygon.STATE = { CHANGE_PIN_HEIGHT: -2, CHANGE_PIN_POSITION: -3 };

Polygon.prototype.updateTarget = function (target) {
    this.lines.forEach(function (line) {
        line.geometry.verticesNeedUpdate = true;
    });

    if (this._closeLine) {
        this._closeLine.geometry.verticesNeedUpdate = true;
    }

    if (this.gridMesh) {
        this.gridMesh.position.set(
            this.gridGenerateOffset.x - target.x,
            this.gridGenerateOffset.y - target.y,
            this.gridGenerateOffset.z - target.z
        );
    }
};

Polygon.prototype.addPin = function (position, height) {
    var index = this.pins.length;
    var pin = new Pin({
        index: index,
        mission: this,
        position: position
    });

    this.pins.push(pin);

    if (this.pins.length > 1) {
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(this.pins[index - 1].head.position);
        lineGeometry.vertices.push(this.pins[index].head.position);
        var line = new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 })
        );
        this.lines.push(line);

        this._map.scene.add(line);

        if (!this._closeLine) {
            var lineGeometry_ = new THREE.Geometry();
            lineGeometry_.vertices.push(this.pins[index].head.position);
            lineGeometry_.vertices.push(this.pins[0].head.position);

            this._closeLine = new THREE.LineSegments(
                lineGeometry_,
                new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 })
            );

            this._map.scene.add(this._closeLine);
        } else {
            this._closeLine.geometry.vertices[0] = this.pins[index].head.position;
            this._closeLine.geometry.verticesNeedUpdate = true;
        }
    }

    if (MapSettings.debug) {
        this.debug = { updated: true };
    }

    return pin;
};

Polygon.prototype.updatePin = function (index) {
    if (index > 0 && index - 1 < this.lines.length) {
        this.lines[index - 1].geometry.verticesNeedUpdate = true;
    }
    if (index + 1 < this.pins.length) {
        this.lines[index].geometry.verticesNeedUpdate = true;
    }

    if (this.pins.length > 1) {
        if (index === 0) {
            this._closeLine.geometry.verticesNeedUpdate = true;
        } else if (index + 1 === this.pins.length) {
            this._closeLine.geometry.verticesNeedUpdate = true;
        }
    }
};

Polygon.prototype.clearPins = function () {
    // Clear all pins
    for (var i = 0; i < this.pins.length; i++) {
        this.pins[i].dispose();
    }
    this.pins.length = 0;

    for (var i_ = 0; i_ < this.lines.length; i_++) {
        var line = this.lines[i_];

        this._map.scene.remove(line);

        line.geometry.dispose();
        line.material.dispose();
        this.lines[i_] = undefined;
    }
    this.lines.length = 0;

    if (this._closeLine) {
        this._map.scene.remove(this._closeLine);

        this._closeLine.geometry.dispose();
        this._closeLine.material.dispose();
        this._closeLine = undefined;
    }

    this.grids = undefined;
    if (this.gridMesh) {
        this._map.scene.remove(this.gridMesh);
        this.gridMesh = undefined;
    }
};

Polygon.prototype.interactableObjects = function () {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
};

/**
 * Mouse down handler
 * @param {OrbitControls} controls
 * @param {number} x
 * @param {number} y
 * @param {number} button
 */
var panStart = new THREE.Vector2();
var picker = new THREE.Raycaster();
Polygon.prototype.onMouseDown = function (controls, x, y, button) {
    var now = Date.now();
    var intersects;

    panStart.set(x, y);

    // Doubled click => Create new PIN
    if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval && this.enableMoveMarker === true) {
        MapUtility.rayCasterFromScreen(controls, x, y, picker);

        intersects = picker.intersectObjects(this._map.quadTree.tiles.children);

        if (!intersects.length) {
            console.warn('Mouse down position have no intersect with any tiles.');
            controls._lastClick = null;
            return true;
        } else if (intersects.length > 1) {
            console.warn('Mouse down on more than one tile.');
        }

        var position = intersects[0].point.add(controls.camera.target);

        this.activePin = this.addPin(position);

        controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
        controls._lastClick = null;

        return true;
    }

    MapUtility.rayCasterFromScreen(controls, x, y, picker);

    intersects = picker.intersectObjects(this.interactableObjects());

    if (intersects.length > 0) {
        var obj = intersects[0].object;
        if (obj.name === 'Head') {
            this.activePin = obj.pin;
            controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
        } else if (obj.name === 'Arrow') {
            this.activePin = obj.pin;
            controls._state = Polygon.STATE.CHANGE_PIN_POSITION;
        }

        return true;
    }

    return false;
};

var panEnd = new THREE.Vector2();
var panDelta = new THREE.Vector2();
/**
 * Mouse move handler
 * @param {OrbitControls} controls
 * @param {number} x
 * @param {number} y
 */
Polygon.prototype.onMouseMove = function (controls, x, y) {
    if (controls._state === Polygon.STATE.CHANGE_PIN_HEIGHT) {
        if (!this.enableMoveMarker) return false;
        panEnd.set(x, y);
        panDelta.subVectors(panEnd, panStart);

        this.activePin.height += -panDelta.y * controls.camera.position.y / controls.canvas.height;

        panStart.copy(panEnd);

        return true;
    } else if (controls._state === Polygon.STATE.CHANGE_PIN_POSITION) {
        if (!this.enableMoveMarker) return false;

        MapUtility.rayCasterFromScreen(controls, x, y, picker);
        // TODO: Deprecated base plane
        var markerPosition = picker.intersectObject(this._map.basePlane)[0].point;
        this.activePin.groundPosition = markerPosition.add(controls.camera.target);

        return true;
    }

    return false;
};

var px = new THREE.Vector3();
Polygon.prototype.generateGrid = function (type, gridSpace, angle, speed, minute) {
    var target = this._map.camera.target;
    this.gridGenerateOffset.set(target.x, target.y, target.z);

    // Call C++ function to genreate flight grid
    if (type === 'opt') {
        if (speed) {
            optimizeGridCalculation.speed = speed;
        }
        if (minute) {
            optimizeGridCalculation.minute = minute;
        }

        var res = optimizeGridCalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate, gridSpace);
        this.grids = res.map(function (x) {
            return x.grid;
        });

        this.angles = res.map(function (x) {
            return x.angle;
        });
    } else {
        if (speed) {
            gridcalculation.speed = speed;
        }
        if (minute) {
            gridcalculation.minute = minute;
        }

        this.grids = gridcalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate, gridSpace, angle || 0);
    }

    // Redraw grid mesh
    // Remove exist mesh first
    if (this.gridMesh) {
        this.gridMesh.children.map(function (mesh) {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.gridMesh.children.length = 0;
        this._map.scene.remove(this.gridMesh);
    }

    // Define grid mesh as an array of consecutive line
    this.gridMesh = new THREE.Group();
    this._map.scene.add(this.gridMesh);
    // Create each grid from geneated data
    for (var j = 0; j < this.grids.length; j++) {
        var grid = this.grids[j];

        var lineGeometry = new THREE.Geometry();
        for (var i = 0; i < grid.length; i++) {
            // Passing Geocoordinate to 3D Point
            sphericalMercator.CartographicToPixel(grid[i], px);
            // Doubling point, so it's will render consecutive line
            var v = px.clone().sub(this.gridGenerateOffset);
            if (i !== 0) lineGeometry.vertices.push(v);
            lineGeometry.vertices.push(v);
        }

        this.gridMesh.add(new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
            // new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
        ));
    }

    return this.grids;
};

Object.defineProperties(Polygon.prototype, {
    pinsCoordinate: {
        get: function () {
            return this.pins.map(function (pin) {
                return pin.coordinate;
            });
        }
    },
});

module.exports = Polygon;
