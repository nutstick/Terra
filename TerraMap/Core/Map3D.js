var MapSettings = require('./MapSettings');
var sphericalMercator = require('../Utility/SphericalMercator');
var QuadTree = require('./QuadTree');
var Camera = require('../Renderer/Camera');
var OrbitControls = require('../Renderer/OrbitControls');
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
 * Map3D Class
 * @alias Map3D
 * @constructor
 *
 * @param {Object} options
 * @param {SceneMode} options.mode - Scene2D or Scene3D
 * @param {Canvas} options.canvas - Canvas
 * @param {eventSource} options.eventSource - EventSource
 * @param {Renderer} options.renderer - Renderer
 * @param {Context2D} options.context2d - Context2D
 */
function Map3D (options) {
    if (!options) throw new Error('No option provided');
    if (!options.mode) throw new Error('No option.mode provided');
    if (!options.canvas) throw new Error('No options.canvas provided');
    if (!options.eventSource) throw new Error('No options.eventSource provided');
    if (!options.renderer) throw new Error('No options.renderer provided');
    if (!options.context2d) throw new Error('No options.context2d provided');

    /**
     * Subsribe camera target object
     * @type {any[]}
     */
    this._subscribeObjects = [];

    /*
    * Setup ThreeJS scene
    */
    this._renderer = options.renderer;

    this.scene = new THREE.Scene();

    this.camera = new Camera({ canvas: options.canvas, map: this });
    this.camera.setPosition({ z: MapSettings.cameraDistance });

    // TODO: target distance min 0.03527380584401122
    this.cameraController = new OrbitControls({
        map: this,
        eventSource: options.eventSource,
        canvas: options.canvas,
    });

    /**
     * @type {Canvas}
     */
    this.canvas = options.canvas;

    /**
     * @type {Context2D}
     */
    this.context2d = options.context2d;

    // Base Plane
    this.basePlane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(MapSettings.basePlaneDimension * 10000, MapSettings.basePlaneDimension * 10000, 1, 1),
        new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity: 0
        }));
    this.basePlane.rotation.x = -0.5 * Math.PI;
    this.basePlane.opacity = 0;
    this.scene.add(this.basePlane);

    /**
     * @type {QuadTree}
     */
    this.quadTree = new QuadTree({
        map: this,
        mode: options.mode
    });

    /**
     * @type Mission[]
    */
    this.missions = [];
    this.newMission();

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

Object.defineProperties(Map3D.prototype, {
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

Map3D.prototype.newMission = function (type) {
    this._currentMission = (type === 'Polyline') ? new Mission({ map: this }) : new Polygon({ map: this });
    this.missions.push(this._currentMission);
    return this._currentMission;
};

Map3D.prototype.update = function () {
    // Quad Tree update
    this.quadTree.update();

    // Mission update
    var scale = this.cameraController.constraint.targetDistance * sphericalMercator.mPerPixel() * 4.0 / this.canvas.height;

    this.vehicle.scale = scale;
    this.missions.forEach(function (mission) {
        mission.pins.forEach(function (pin) {
            pin.scale = scale;
        });
    });
};

Map3D.prototype.generateGrid = function (type) {
    this._currentMission.generateGrid(type || 'opt', 4);
};

Map3D.prototype.guide = function () {
    this.cameraController.guide(this.vehicle);
};

Map3D.prototype.setView = function (position, zoom) {
    this.cameraController.setView(position, zoom);
};

Map3D.prototype.resizeView = function (canvas) {
    this.camera.aspect = canvas.width / canvas.height;
    this.camera.updateProjectionMatrix();

    this._renderer.setPixelRatio(canvas.devicePixelRatio);
    this._renderer.setSize(canvas.width, canvas.height);
};

Map3D.prototype.addSubscribeObject = function (object) {
    this._subscribeObjects.push(object);
};

Map3D.prototype.removeSubscribeObject = function (object) {
    var index = this._subscribeObjects.indexOf(object);

    if (index !== -1) {
        this._subscribeObjects.splice(index, 1);
    }

    return this;
};

module.exports = Map3D;
