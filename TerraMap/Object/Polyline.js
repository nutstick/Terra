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
