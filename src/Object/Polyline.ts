import * as THREE from 'three';
import { Geometry, Material } from 'three';
import { Map3D } from '../Core/Map3D';
import { MapSettings } from '../Core/MapSettings';
import { Cartesian } from '../Math/Cartesian';
import { OrbitControls } from '../Renderer/OrbitControls';
import { MapUtility } from '../Utility/MapUtility';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { Mission, MissionOptions } from './Mission';
import { Pin } from './Pin';

const panStart = new THREE.Vector2();
const picker = new THREE.Raycaster();

const panEnd = new THREE.Vector2();
const panDelta = new THREE.Vector2();

const px = new THREE.Vector3();

export interface PolygonOptions extends MissionOptions {}

export class Polyline extends Mission {
    static STATE = { CHANGE_PIN_HEIGHT: -2, CHANGE_PIN_POSITION: -3 };

    _map: Map3D;
    pins: Pin[];
    angles: number[];
    lines: THREE.LineSegments[];

    debug: { updated: boolean; };

    enableMoveMarker: boolean;
    activePin: Pin;

    constructor(options: MissionOptions) {
        super(options);
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
        this.debug = {
            updated: false,
        };
        this._map.addSubscribeObject(this);
        /**
         * Controller
         */
        /**
         * Set to false to disable marker modifiered
         * @type {bool}
         */
        this.enableMoveMarker = true;
        this.activePin = undefined;
    }

    updateTarget(target: Cartesian) {
        this.lines.forEach(function(line) {
            (line.geometry as Geometry).verticesNeedUpdate = true;
        });
    }

    addPin(position?: Cartographic | Cartesian, height?: number) {
        const index = this.pins.length;
        const pin = new Pin({
            index,
            mission: (this as Mission),
            position,
        });
        this.pins.push(pin);
        if (this.pins.length > 1) {
            const lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(this.pins[index - 1].head.position);
            lineGeometry.vertices.push(this.pins[index].head.position);
            const line = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }));
            this.lines.push(line);
            this._map.scene.add(line);
        }
        if (MapSettings.debug) {
            this.debug = { updated: true };
        }
        return pin;
    }

    updatePin(index: number) {
        if (index > 0 && index - 1 < this.lines.length) {
            (this.lines[index - 1].geometry as Geometry).verticesNeedUpdate = true;
        }
        if (index + 1 < this.pins.length) {
            (this.lines[index].geometry as Geometry).verticesNeedUpdate = true;
        }
    }

    clearPins() {
        // Clear all pins
        for (let i = 0; i < this.pins.length; i++) {
            this.pins[i].dispose();
        }
        this.pins.length = 0;
        for (let i_ = 0; i_ < this.lines.length; i_++) {
            const line = this.lines[i_];
            this._map.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
            this.lines[i_] = undefined;
        }
        this.lines.length = 0;
    }

    interactableObjects() {
        return this.pins.reduce(function(prev: THREE.Mesh[], pin) {
            prev.push(pin.head);
            prev.push(pin.arrow);
            return prev;
        }, []);
    }

    onMouseDown(controls: OrbitControls, x: number, y: number, button: number) {
        const now = Date.now();
        let intersects;
        panStart.set(x, y);
        // Doubled click => Create new PIN
        if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval && this.enableMoveMarker === true) {
            MapUtility.rayCasterFromScreen(controls, x, y, picker);
            intersects = picker.intersectObjects(this._map.quadTree.tiles.children);
            if (!intersects.length) {
                console.warn('Mouse down position have no intersect with any tiles.');
                controls._lastClick = null;
                return true;
            }
            else if (intersects.length > 1) {
                console.warn('Mouse down on more than one tile.');
            }
            const position = intersects[0].point.add(controls.camera.target);
            this.activePin = this.addPin(position);
            controls._state = Polyline.STATE.CHANGE_PIN_HEIGHT;
            controls._lastClick = null;
            return true;
        }
        MapUtility.rayCasterFromScreen(controls, x, y, picker);
        intersects = picker.intersectObjects(this.interactableObjects());
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.name === 'Head') {
                this.activePin = obj.pin;
                controls._state = Polyline.STATE.CHANGE_PIN_HEIGHT;
            }
            else if (obj.name === 'Arrow') {
                this.activePin = obj.pin;
                controls._state = Polyline.STATE.CHANGE_PIN_POSITION;
            }
            return true;
        }
        return false;
    }

    onMouseMove(controls, x, y) {
        if (controls._state === Polyline.STATE.CHANGE_PIN_HEIGHT) {
            if (!this.enableMoveMarker)
                return false;
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);
            this.activePin.height += -panDelta.y * controls.camera.position.y / controls.canvas.height;
            panStart.copy(panEnd);
            return true;
        }
        else if (controls._state === Polyline.STATE.CHANGE_PIN_POSITION) {
            if (!this.enableMoveMarker)
                return false;
            MapUtility.rayCasterFromScreen(controls, x, y, picker);
            // TODO: Deprecated base plane
            const markerPosition = picker.intersectObjects(this._map.quadTree.tiles.children)[0].point;
            this.activePin.groundPosition = markerPosition.add(controls.camera.target);
            return true;
        }
        return false;
    }

    get pinsCoordinate() {
        return this.pins.map(function(pin) {
            return pin.coordinate();
        });
    }

    coordinate() {
        return QtPositioning.coordinate();
    }
    getScale() { return 1; }
    setScale(scale) {}
}
