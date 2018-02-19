Qt.include('/three.js')
Qt.include('/Object/Pin.js')

var defaultSphericalMercator = new SphericalMercator({
    size: MapSettings.basePlaneDimension
});

function Polygon(options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');
    this._map = map;

    this.pins = [];

    this.lines = [];

    this.grid = [];
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
            new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
        );
        this.lines[index - 1] = line;

        this._map.scene.add(line);

        if (!this._closeLine) {
            var lineGeometry_ = new THREE.Geometry();
            lineGeometry_.vertices.push(this.pins[index].head.position.clone());
            lineGeometry_.vertices.push(this.pins[0].head.position.clone());

            this._closeLine = new THREE.LineSegments(
                lineGeometry_,
                new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
            );

            this._map.scene.add(this._closeLine);
        } else {
            this._closeLine.geometry.vertices[0].copy(this.pins[index].head.position);
            this._closeLine.geometry.verticesNeedUpdate = true;
        }
    }

    return pin;
}

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
}

Polygon.prototype.reindex = function(pin, index) {
    // TODO:
    console.log('Not implemented');
}

Polygon.prototype.interactableObjects = function() {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
}

Polygon.prototype.generateGrid = function() {
    var grid = gridcalculation.genGridInsideBound(this.pins.map(function(pin) {
        return pin.coordinate;
    }), 4000, 0);

    console.log(grid.length)

    var lineGeometry = new THREE.Geometry();
    for (var i = 0; i < grid.length; i++) {
        var px = defaultSphericalMercator.px(grid[i], 0);
        console.log(px.x, px.y, grid[i].latitude, grid[i].longitude)
        lineGeometry.vertices.push(new THREE.Vector3(px.x, 50, px.y));
    }
    this.grid = new THREE.LineSegments(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
    );

    this._map.scene.add(this.grid);

    return grid;
}
