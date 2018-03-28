/**
 * Polyline Class
 * @alias Polyline
 * @constructor
 * 
 * @param {Object} options 
 * @param {Map} options.map
 */
function Polyline(options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');
    /**
     *
     * @type {Map} Map
     * @private
     */
    this._map = map;

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

Polyline.prototype.addPin = function(position, height) {
    var index = this.pins.length;
    var pin = new Pin({
        index: index,
        mission: this,
        position: position,
        height: height
    });
    this.pins.push(pin);

    if (this.pins.length > 1) {
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(this.pins[index - 1].head.position.clone());
        lineGeometry.vertices.push(this.pins[index].head.position.clone());
        var line = new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
        );
        this.lines[index - 1] = line;

        this._map.scene.add(line);
    }

    return pin;
}

Polyline.prototype.updatePin = function(index) {
    if (index > 0) {
        this.lines[index-1].geometry.vertices[1].copy(this.pins[index].head.position);
        this.lines[index-1].geometry.verticesNeedUpdate = true;
    }
    if (index + 1 < this.pins.length) {
        this.lines[index].geometry.vertices[0].copy(this.pins[index].head.position);
        this.lines[index].geometry.verticesNeedUpdate = true;
    }
}

Polyline.prototype.interactableObjects = function() {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
}

module.exports = Polyline;