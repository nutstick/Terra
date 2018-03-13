Qt.include('/three.js')
Qt.include('/Object/Pin.js')

function Mission(options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');
    this._map = map;

    this.pins = [];

    this.lines = [];
}

Mission.prototype.addPin = function(position, height) {
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

Mission.prototype.updatePin = function(index) {
    if (index > 0) {
        this.lines[index-1].geometry.vertices[1].copy(this.pins[index].head.position);
        this.lines[index-1].geometry.verticesNeedUpdate = true;
    }
    if (index + 1 < this.pins.length) {
        this.lines[index].geometry.vertices[0].copy(this.pins[index].head.position);
        this.lines[index].geometry.verticesNeedUpdate = true;
    }
}

Mission.prototype.reindex = function(pin, index) {
    // TODO:
    console.log('Not implemented');
}

Mission.prototype.interactableObjects = function() {
    return this.pins.reduce(function (prev, pin) {
        prev.push(pin.head);
        prev.push(pin.arrow);
        return prev;
    }, []);
}
