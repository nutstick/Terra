var MapSettings = require('./MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator');
var QuadTree = require('./QuadTree');
var Cartesian = require('../Math/Cartesian');
var Camera = require('../Renderer/Camera');
var Mission = require('../Object/Mission');
var Polygon = require('../Object/Polygon');
var Vehicle = require('../Object/Vehicle');

var DState = {
    GROUND: 0,
    TAKEOFF: 1
};

/**
 * @typedef {Object} Canvas
 * @property {number} width
 * @property {number} height
 */

/**
 * Map Class
 * @alias Map
 * @constructor
 *
 * @param {Object} options
 * @param {SceneMode} options.mode - Scene2D or Scene3D
 * @param {Canvas} options.canvas - Canvas
 * @param {eventSource} options.eventSource - EventSource
 * @param {Renderer} options.renderer - Renderer
 */
function Map (options) {
    if (!options) throw new Error('No option provided');
    if (!options.mode) throw new Error('No option.mode provided');
    if (!options.canvas) throw new Error('No options.canvas provided');
    if (!options.eventSource) throw new Error('No options.eventSource provided');
    if (!options.renderer) throw new Error('No options.renderer provided');

    /*
    * Setup ThreeJS scene
    */
    this.scene = new THREE.Scene();

    this.camera = new Camera({ canvas: options.canvas });
    this.camera.setPosition({ z: MapSettings.cameraDistance });

    this.cameraController = new THREE.OrbitControls({
        map: this,
        eventSource: options.eventSource,
        canvas: options.canvas,
    });

    this.cameraController.targetCartographic = QtPositioning.coordinate();
    this.cameraController.targetCartesian = new Cartesian();

    // Base Plane
    this.basePlane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(MapSettings.basePlaneDimension * 100, MapSettings.basePlaneDimension * 100, 1, 1),
        new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity: 0
        }));
    this.basePlane.rotation.x = -0.5 * Math.PI;
    this.basePlane.opacity = 0;
    this.scene.add(this.basePlane);

    this._renderer = options.renderer;

    /**
     * @type {QuadTree}
     */
    this.quadTree = new QuadTree({
        map: this,
        mode: options.mode
    });

    // Mission
    this.missions = [];
    this._currentMission = undefined;

    /**
     * @type {Vehicle}
     */
    this.vehicle = new Vehicle({ map: this });

    /**
     * Drone State
     * @type {number}
     */
    this.state = DState.GROUND;
}

Object.defineProperties(Map.prototype, {
    currentMission: {
        get: function () {
            if (!this._currentMission) {
                this._currentMission = new Polygon({ map: this });
                this.missions.push(this._currentMission);
            }
            return this._currentMission;
        }
    },
    vehiclePosition: {
        get: function (position) {
            return this.vehicle.position;
        },
        set: function (position) {
            this.vehicle.position = position;
        }
    }
});

Map.prototype.newMission = function (type) {
    this._currentMission = (type === 'Polyline') ? new Mission({ map: this }) : new Polygon({ map: this });
    this.missions.push(this._currentMission);
    return this._currentMission;
};

Map.prototype.update = function () {
    // Quad Tree update
    this.quadTree.update();

    // Mission update
    var scaleFactor = 120;
    var scale = this.camera.position.y / scaleFactor;

    this.vehicle.scale = scale;
    this.missions.forEach(function (mission) {
        mission.pins.forEach(function (pin) {
            pin.setScale(scale);
        });
    });
};

Map.prototype.addPin = function (picker) {
    var position = picker.intersectObject(this.basePlane)[0].point;

    if (typeof this._currentMission === 'undefined') {
        this._currentMission = new Polygon({ map: this });
        this.missions.push(this._currentMission);
    }

    return this._currentMission.addPin(position);
};

Map.prototype.generateGrid = function (type) {
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

    this._currentMission.generateGrid(type || 'opt', 4);
};

Map.prototype.mouseDownOnMarkers = function (picker) {
    var intersect = picker.intersectObjects(this.currentMission.interactableObjects(), true);

    for (var i = 0; i < intersect.length; i++) {
        return intersect[i].object;
    }

    return null;
};

Map.prototype.setView = function (position, zoom) {
    var px = new THREE.Vector3();
    sphericalMercator.CartographicToPixel(position, px);
    this.cameraController.target.x = px.x;
    // FIXME: Y
    this.cameraController.target.y = 0;
    this.cameraController.target.z = px.z;

    var distance = Math.pow(0.5, (zoom - 4)) * MapSettings.cameraDistance;

    var c = new THREE.Vector3();
    var bearing = this.cameraController.getAzimuthalAngle();
    var pitch = this.cameraController.getPolarAngle();
    c.x = px.x - Math.sin(bearing) * Math.sin(pitch) * distance;
    c.z = px.z + Math.cos(bearing) * Math.sin(pitch) * distance;
    c.y = Math.cos(pitch) * distance;

    var camera = this.cameraController.object;

    camera.setPosition(c);

    camera.lookAt(this.cameraController.target);
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(this.cameraController.object.matrixWorld);

    this.quadTree.needUpdate = true;
};

Map.prototype.resizeView = function (canvas) {
    this.camera.aspect = canvas.width / canvas.height;
    this.camera.updateProjectionMatrix();

    this._renderer.setPixelRatio(canvas.devicePixelRatio);
    this._renderer.setSize(canvas.width, canvas.height);
};

module.exports = Map;