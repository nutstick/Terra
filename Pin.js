Qt.include('/three.js')
Qt.include('/Utility/SphericalMercator.js');

var defaultSphericalMercator = new SphericalMercator({
    size: MapSettings.basePlaneDimension
});

function Pin(options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.mission === 'undefined') throw new Error('No options.mission provided');
    this._mission = options.mission;

    if (typeof options.index === 'undefined') throw new Error('No options.index provided');
    this._index = options.index;

    if (options.position) {
        if (options.position.longitude) {
            var pt = defaultSphericalMercator.px(options.position, 0);
            var meterPerPixel = defaultSphericalMercator.mPerPixel(options.position.latitude);
            this.height = options.position.attitude / meterPerPixel;
        } else {
            this.position = options.position ? options.position.clone() : new THREE.Vector3(0, 0, 0);
            this.height = options.height | 10 / defaultSphericalMercator.mPerPixel(0);
        }
    }

    // Head geometry
    this.headGeometry = new THREE.CylinderGeometry( 3, 3, 8, 8, 1 );
    // Recalculate centroid
    for (var i = 0, len = this.headGeometry.vertices.length; i < len; i++) {
        this.headGeometry.vertices[i].y += 8;
    }
    this.headGeometry.computeBoundingSphere();
    this.head = new THREE.Mesh(
        this.headGeometry,
        new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true })
    );
    this.head.name = 'Head';
    this.head.pin = this;

    // Line between head and arrow geometry
    this.lineGeometry = new THREE.Geometry();
    this.lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.lineGeometry.vertices.push(new THREE.Vector3(0, 8, 0));
    this.line = new THREE.LineSegments(
        this.lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 })
    );
    this.line.name = 'Line';

    // Arrow geometry
    this.arrowGeometry = new THREE.CylinderGeometry( 4, 0, 6, 6, 1 );
    // Recalculate centroid
    for (var i = 0, len = this.arrowGeometry.vertices.length; i < len; i++) {
        this.arrowGeometry.vertices[i].y += 3;
    }
    this.arrowGeometry.computeBoundingSphere();
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

    this.group = new THREE.Group();
    this.group.add(this.head);
    this.group.add(this.line);
    this.group.add(this.arrow);

    // TODO: Better Add to scene function
    this._mission._map.scene.add(this.group)

    this.lastScale = undefined;
}

Pin.prototype.offsetHeight = function(delta) {
    this.height += delta;
    // Update Head position
    this.head.position.copy(this.position);
    this.head.position.y += this.height;
    // Update Line position
    this.line.geometry.vertices[1].y = this.height;
    this.line.geometry.verticesNeedUpdate = true;

    // TODO: line between pin update
    this._mission.updatePin(this._index);
}

Pin.prototype.setScale = function(scale) {
    if (this.lastScale === scale) return;

    this.lastScale = scale;

    this.head.scale.set(scale, scale, scale);
    this.head.geometry.computeBoundingSphere();
    this.arrow.scale.set(scale, scale, scale);
    this.head.geometry.computeBoundingSphere();
}

Pin.prototype.setPosition = function(position) {
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
}

Object.defineProperties(Pin.prototype, {
    coordinate: {
        get: function() {
            var ll = defaultSphericalMercator.ll([this.position.x + MapSettings.basePlaneDimension / 2,
                                                  this.position.z + MapSettings.basePlaneDimension / 2], 0);
            var meterPerPixel = defaultSphericalMercator.mPerPixel(ll.latitude);
            ll.altitude = this.height * meterPerPixel;

            return ll;
        }
    }
})
