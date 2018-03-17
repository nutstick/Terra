Qt.include("/Core/MapSettings.js");
Qt.include("/Core/QuadTree.js");
Qt.include("/Object/Mission.js");
Qt.include("/Object/Polygon.js");
Qt.include("/Utility/SphericalMercator.js");
Qt.include("/three.js");
Qt.include("/lib/OrbitControls.js");
var sphericalMercator = new SphericalMercator({ size: MapSettings.basePlaneDimension });

/**
 * Map Class
 * @alias Map
 * @constructor
 * 
 * @param {Object} options 
 * @param {SceneMode} options.mode - Scene2D or Scene3D
 * @param {Canvas} options.canvas - Canvas
 * @param {eventSource} options.eventSource - EventSource
 * @param {Qt.Positioning} options.takeoffPoint - Take off coordinate
 */
function Map(options) {
    if (!options) throw new Error('No option provided');
    if (!options.mode) throw new Error('No option.mode provided');
    if (!options.canvas) throw new Error('No options.canvas provided');
    if (!options.eventSource) throw new Error('No options.eventSource provided');

    if (!options.takeoffPoint) throw new Error('No takeoffPoint provided');
    /*
    * Setup ThreeJS scene
    */
   this.scene = new THREE.Scene();
   
   this.camera = new THREE.PerspectiveCamera(70, width / height, 1/99, 100000000000000);
   this.camera.position.z = 12000;
   
   this.cameraController = new THREE.OrbitControls({
       map: this,
       eventSource: options.eventSource,
       canvas: options.canvas,
    });
    // Base Plane
    this.basePlane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(MapSettings.basePlaneDimension*100, MapSettings.basePlaneDimension*100, 1, 1),
        new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity:0
        }));
    this.basePlane.rotation.x = -0.5*Math.PI;
    this.basePlane.opacity=0;
    this.scene.add(this.basePlane);

    this._renderer = new THREE.Canvas3DRenderer({ canvas: options.canvas, antialias: true, devicePixelRatio: options.canvas.devicePixelRatio });
    this._renderer.setSize(options.canvas.width, options.canvas.height);

    /**
     * @type {QuadTree}
     */
    this.quadTree = new QuadTree({
        map: this,
        mode: options.mode
    });
    // Mission
    this.takeoffPoint = options.takeoffPoint;
    this.missions = [];
    this._currentMission = undefined;
}

Object.defineProperties(Map.prototype, {
    currentMission: {
        get: function() {
            if (!this._currentMission) {
                this._currentMission = new Polygon({ map: this });
                this.missions.push(this._currentMission);
            }
            return this._currentMission;
        }
    }
});

Map.prototype.newMission = function(type) {
    this._currentMission = (type == 'Polyline') ? new Mission({ map: this}) : new Polygon({ map: this });
    this.missions.push(this._currentMission);
    return  this._currentMission;
}

Map.prototype.update = function() {
    // Quad Tree update
    this.quadTree.update();

    // Mission update
    var scaleFactor = 120;
    var scale = this.camera.position.y / scaleFactor;

    this.missions.forEach(function (mission) {
        mission.pins.forEach(function(pin) {
            pin.setScale(scale);
        });
    });
}

Map.prototype.addPin = function(picker) {
    var position = picker.intersectObject(this.basePlane)[0].point;

    if (typeof this._currentMission === 'undefined') {
        this._currentMission = new Polygon({ map: map });
        this.missions.push(this._currentMission);
    }

    return this._currentMission.addPin(position);
}

Map.prototype.generateGrid = function() {
    // FIXME: Debuging, Test Case #1
    // this.newMission();
    // var pts = [
    //     QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10),
    //     QtPositioning.coordinate(13.739013102055642, 100.53072382364125, 10),
    //     QtPositioning.coordinate(13.738934237108017, 100.53124540615603, 10),
    //     QtPositioning.coordinate(13.73829834824066, 100.53111367933914, 10)
    // ];
    // var scope = this;
    // pts.forEach(function(pt) {
    //     scope.currentMission.addPin(pt);
    // });

    this._currentMission.generateGrid(4);
}

Map.prototype.mouseDownOnMarkers = function(picker) {
    var intersect = picker.intersectObjects(this.currentMission.interactableObjects(), true);

    for (var i = 0; i < intersect.length; i++) {
        return intersect[i].object;
    }

    return null;
}

Map.prototype.setView = function(position, zoom) {
    var px = sphericalMercator.px(position, 0);
    // FIXME: y = 0 in 2D map case
    px = { x: px.x - MapSettings.basePlaneDimension / 2, y: 0, z: px.y - MapSettings.basePlaneDimension / 2};
    this.cameraController.target.copy(px);

    var distance = Math.pow(0.5, (zoom-4)) * MapSettings.cameraDistance;

    var c = new THREE.Vector3();
    var bearing = this.cameraController.getAzimuthalAngle();
    var pitch = this.cameraController.getPolarAngle();
    c.x = px.x - Math.sin(bearing)*Math.sin(pitch)*distance;
    c.z = px.z + Math.cos(bearing)*Math.sin(pitch)*distance;
    c.y = Math.cos(pitch) * distance;

    var camera = this.cameraController.object;

    camera.position.copy(c);

    camera.lookAt(this.cameraController.target);
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(this.cameraController.object.matrixWorld);

    this.quadTree.needUpdate = true;
}

Map.prototype.resizeView = function(canvas) {
    this.camera.aspect = canvas.width / canvas.height;
    this.camera.updateProjectionMatrix();

    this._renderer.setPixelRatio(canvas.devicePixelRatio);
    this._renderer.setSize(canvas.width, canvas.height);
}
