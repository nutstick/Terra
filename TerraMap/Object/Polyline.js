var Pin = require('./Pin');

/**
 * Polyline Class
 * @alias Polyline
 * @constructor
 *
 * @param {Object} options
 * @param {Map} options.map
 */
function Polyline (options) {
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
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this.lines = [];
}

Polyline.prototype.addPin = function (position, height) {
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
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
        );
        this.lines.push(line);

        this._map.scene.add(line);
    }

    if (MapSettings.debug) {
        this.debug = { updated: true };
    }

    return pin;
};

Polyline.prototype.updatePin = function (index) {
    if (index > 0 && index - 1 < this.lines.length) {
        this.lines[index - 1].geometry.verticesNeedUpdate = true;
    }
    if (index + 1 < this.pins.length) {
        this.lines[index].geometry.verticesNeedUpdate = true;
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
};

Polyline.prototype.interactableObjects = function () {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
};

var panStart = new THREE.Vector2();
var picker = new THREE.Raycaster();
/**
 * Mouse down handler
 * @param {OrbitControls} controls
 * @param {number} x
 * @param {number} y
 * @param {number} button
 */
Polygon.prototype.onMouseDown = function (controls, x, y, button) {
    var now = Date.now();
    panStart.set(x, y);

    // Doubled click => Create new PIN
    if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval && this.enableMoveMarker === true) {
        MapUtility.rayCasterFromScreen(controls, x, y, picker)

        var intersects = picker.intersectObjects(this._map.quadTree.tiles.children);

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

    var intersects = picker.intersectObjects(this.interactableObjects());

    if (intersects.length > 0) {
        var obj = intersects[0].object;
        if (obj.name === 'Head') {
            controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
        } else if (obj.name === 'Arrow') {
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

Object.defineProperties(Polyline.prototype, {
    pinsCoordinate: {
        get: function () {
            return this.pins.map(function (pin) {
                return pin.coordinate;
            });
        }
    }
});


module.exports = Polyline;
