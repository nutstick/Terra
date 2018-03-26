var Pin = require('./Pin');
var MapSettings = require('../Core/MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator');

/**
 * Polygon Class
 * @alias Polygon
 * @constructor
 * 
 * @param {Object} options 
 * @param {Map} options.map
 */
function Polygon(options) {
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
     * Array of List of coordination that is generated as grid
     * @type {QtPositioning.coordinate[][]}
     */
    this.grids = [];

    /**
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this.lines = [];

    /**
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this.gridMesh = [];

    /**
     * Three.Line
     * @type {THREE.LineSegments}
     */
    this._closeLine = undefined;
}

Polygon.prototype.addPin = function(position, height) {
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
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 })
        );
        this.lines[index - 1] = line;

        this._map.scene.add(line);

        if (!this._closeLine) {
            var lineGeometry_ = new THREE.Geometry();
            lineGeometry_.vertices.push(this.pins[index].head.position.clone());
            lineGeometry_.vertices.push(this.pins[0].head.position.clone());

            this._closeLine = new THREE.LineSegments(
                lineGeometry_,
                new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 })
            );

            this._map.scene.add(this._closeLine);
        } else {
            this._closeLine.geometry.vertices[0].copy(this.pins[index].head.position);
            this._closeLine.geometry.verticesNeedUpdate = true;
        }
    }

    return pin;
};

Polygon.prototype.updatePin = function(index) {
    if (index > 0) {
        this.lines[index-1].geometry.vertices[1].copy(this.pins[index].head.position);
        this.lines[index-1].geometry.verticesNeedUpdate = true;
    }
    if (index + 1 < this.pins.length) {
        this.lines[index].geometry.vertices[0].copy(this.pins[index].head.position);
        this.lines[index].geometry.verticesNeedUpdate = true;
    }

    if (this.pins.length > 1) {
        if (index === 0) {
            this._closeLine.geometry.vertices[1].copy(this.pins[index].head.position);
            this._closeLine.geometry.verticesNeedUpdate = true;
        } else if (index + 1 === this.pins.length) {
            this._closeLine.geometry.vertices[0].copy(this.pins[index].head.position);
            this._closeLine.geometry.verticesNeedUpdate = true;
        }
    }
};

Polygon.prototype.interactableObjects = function() {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
};

Polygon.prototype.generateGrid = function(type, gridSpace) {
    // Call C++ function to genreate flight grid
    this.grids = type === 'opt' ? optimizeGridCalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate, gridSpace) :
                gridcalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate, gridSpace, 0);

    // Redraw grid mesh
    // Remove exist mesh first
    if (this.gridMesh) {
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
            var px = sphericalMercator.px(grid[i], 0);
            var meterPerPixel = sphericalMercator.mPerPixel(grid[i].latitude);
            // Doubling point, so it's will render consecutive line
            if (i != 0) lineGeometry.vertices.push(new THREE.Vector3(px.x - MapSettings.basePlaneDimension / 2, grid[i].altitude / meterPerPixel, px.y - MapSettings.basePlaneDimension / 2));
            lineGeometry.vertices.push(new THREE.Vector3(px.x - MapSettings.basePlaneDimension / 2, grid[i].altitude / meterPerPixel, px.y - MapSettings.basePlaneDimension / 2));
        }

        this.gridMesh.add(new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
            // new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
        ));
    }
};

Object.defineProperties(Polygon.prototype, {
    pinsCoordinate: {
        get: function() {
            return this.pins.map(function(pin) {
                return pin.coordinate;
            });
        }
    }
});

module.exports = Polygon;
