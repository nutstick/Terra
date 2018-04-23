import * as THREE from 'three';
import { Renderer } from 'three';
import { Mission } from '../Object/Mission';
import { Polygon } from '../Object/Polygon';
import { Polyline } from '../Object/Polyline';
import { RenderingObject } from '../Object/RenderingObject';
import { Skybox } from '../Object/Skybox';
import { Vehicle } from '../Object/Vehicle';
import { Camera } from '../Renderer/Camera';
import { OrbitControls } from '../Renderer/OrbitControls';
import { SceneMode } from '../SceneMode/SceneMode';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { MapSettings } from './MapSettings';
import { QuadTree } from './QuadTree';

export interface IOptions {
    mode: SceneMode;
    canvas: QtCanvas;
    eventSource?: EventSource;
    renderer?: Renderer;
    context2d?: Context2D;
}

export class Map3D {
    static State = {
        GROUND: 0,
        TAKEOFF: 1,
    };

    quadTree: QuadTree;

    camera: Camera;
    cameraController: OrbitControls;
    scene: THREE.Scene;
    canvas: QtCanvas;
    context2d: Context2D;

    _renderer: Renderer;
    _subscribeObjects: RenderingObject[];

    missions: Mission[];
    _currentMission: Mission;

    state: number;

    vehicle: Vehicle;

    constructor(options) {
        this._subscribeObjects = [];
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

        this.canvas = options.canvas;

        this.context2d = options.context2d;

        this.quadTree = new QuadTree({
            map: this,
            mode: options.mode,
        });

        this.missions = [];
        this.newMission();

        // Add skybox
        const skybox = new Skybox();
        this.scene.add(skybox);

        /**
         * @type {Vehicle}
         */
        this.vehicle = new Vehicle({ map: this });

        this.state = Map3D.State.GROUND;
    }

    get currentMission() {
        if (!this._currentMission) {
            this._currentMission = new Polygon({ map: this });
            this.missions.push(this._currentMission);
        }
        return this._currentMission;
    }

    get vehiclePosition() {
        return this.vehicle.position;
    }
    set vehiclePosition(cartographic: Cartographic) {
        this.vehicle.position = cartographic;
    }

    newMission(type?: string) {
        this._currentMission = (type === 'Polyline') ? new Polyline({ map: this }) : new Polygon({ map: this });
        this.missions.push(this._currentMission);
        return this._currentMission;
    }

    update() {
        // Quad Tree update
        this.quadTree.update();

        // Mission update
        const scale = this.cameraController.constraint.targetDistance *
            sphericalMercator.mPerPixel() * 4.0 / this.canvas.height;

        this.vehicle.setScale(scale);
        this.missions.forEach((mission) => {
            mission.pins.forEach((pin) => {
                pin.setScale(scale);
            });
        });
    }

    generateGrid(type?: string) {
        (this._currentMission as Polygon).generateGrid(type || 'opt', 4);
    }

    guide() {
        this.cameraController.guide(this.vehicle);
    }

    setView(position: Cartographic, zoom: number) {
        this.cameraController.setView(position, zoom);
    }

    resizeView(canvas: QtCanvas) {
        this.camera.aspect = canvas.width / canvas.height;
        this.camera.updateProjectionMatrix();

        if ((this._renderer as any).setPixelRatio) {
            (this._renderer as any).setPixelRatio(canvas.devicePixelRatio);
        }
        this._renderer.setSize(canvas.width, canvas.height);
    }

    addSubscribeObject(object: RenderingObject) {
        this._subscribeObjects.push(object);
    }

    removeSubscribeObject(object: RenderingObject) {
        const index = this._subscribeObjects.indexOf(object);

        if (index !== -1) {
            this._subscribeObjects.splice(index, 1);
        }

        return this;
    }
}
