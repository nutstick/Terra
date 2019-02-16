import * as THREE from 'three';
import { Geometry, Material } from 'three';
import { Map3D } from '../Core/Map3D';
import { MapSettings } from '../Core/MapSettings';
import { Cartesian } from '../Math/Cartesian';
import { Cartographic } from '../Math/Cartographic';
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

export class Polygon extends Mission {
    static STATE = { CHANGE_PIN_HEIGHT: -2, CHANGE_PIN_POSITION: -3 };

    _map: Map3D;
    pins: Pin[];
    grids: Cartographic[][];
    angles: number[];
    lines: THREE.LineSegments[];

    gridMesh: THREE.Group;
    gridGenerateOffset: THREE.Vector3 = new THREE.Vector3();
    _closeLine: THREE.LineSegments;

    debug: { updated: boolean; };

    enableMoveMarker: boolean;
    activePin: Pin;

    constructor(options: MissionOptions) {
        super(options);

        this.pins = [];

        this.grids = [];

        this.angles = [];

        this.lines = [];

        this.gridMesh = undefined;
        this.gridGenerateOffset = new THREE.Vector3();

        this._closeLine = undefined;
        this.debug = {
            updated: false,
        };
        this._map.addSubscribeObject(this);
        /**
         * Controller
         */

        this.enableMoveMarker = true;
        this.activePin = undefined;
    }

    updateTarget(target: Cartesian) {
        this.lines.forEach((line) => {
            (line.geometry as Geometry).verticesNeedUpdate = true;
        });
        if (this._closeLine) {
            (this._closeLine.geometry as Geometry).verticesNeedUpdate = true;
        }
        if (this.gridMesh) {
            this.gridMesh.position.set(
                this.gridGenerateOffset.x - target.x,
                this.gridGenerateOffset.y - target.y,
                this.gridGenerateOffset.z - target.z,
            );
        }
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
            const line = new THREE.LineSegments(
                lineGeometry,
                new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }),
            );
            this.lines.push(line);
            this._map.scene.add(line);
            if (!this._closeLine) {
                const lineGeometry_ = new THREE.Geometry();
                lineGeometry_.vertices.push(this.pins[index].head.position);
                lineGeometry_.vertices.push(this.pins[0].head.position);
                this._closeLine = new THREE.LineSegments(
                    lineGeometry_,
                    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }),
                );
                this._map.scene.add(this._closeLine);
            } else {
                (this._closeLine.geometry as Geometry).vertices[0] = this.pins[index].head.position;
                (this._closeLine.geometry as Geometry).verticesNeedUpdate = true;
            }
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
        if (this.pins.length > 1) {
            if (index === 0) {
                (this._closeLine.geometry as Geometry).verticesNeedUpdate = true;
            } else if (index + 1 === this.pins.length) {
                (this._closeLine.geometry as Geometry).verticesNeedUpdate = true;
            }
        }
    }

    clearPins() {
        // Clear all pins
        this.pins.forEach((pin) => {
            pin.dispose();
        });
        this.pins.length = 0;
        for (let i_ = 0; i_ < this.lines.length; i_++) {
            const line = this.lines[i_];
            this._map.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
            this.lines[i_] = undefined;
        }
        this.lines.length = 0;
        if (this._closeLine) {
            this._map.scene.remove(this._closeLine);
            this._closeLine.geometry.dispose();
            this._closeLine.material.dispose();
            this._closeLine = undefined;
        }
        this.grids = undefined;
        if (this.gridMesh) {
            this._map.scene.remove(this.gridMesh);
            this.gridMesh = undefined;
        }
    }

    interactableObjects() {
        return this.pins.reduce((prev: THREE.Mesh[], pin) => {
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
        if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval &&
            this.enableMoveMarker === true) {
            MapUtility.rayCasterFromScreen(controls, x, y, picker);
            intersects = picker.intersectObjects(this._map.quadTree.tiles.children);
            if (!intersects.length) {
                console.warn('Mouse down position have no intersect with any tiles.');
                controls._lastClick = null;
                return true;
            } else if (intersects.length > 1) {
                console.warn('Mouse down on more than one tile.');
            }
            const position = intersects[0].point.add(controls.camera.target);
            this.activePin = this.addPin(position);
            controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
            controls._lastClick = null;
            return true;
        }
        MapUtility.rayCasterFromScreen(controls, x, y, picker);
        intersects = picker.intersectObjects(this.interactableObjects());
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.name === 'Head') {
                this.activePin = obj.pin;
                controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
            } else if (obj.name === 'Arrow') {
                this.activePin = obj.pin;
                controls._state = Polygon.STATE.CHANGE_PIN_POSITION;
            }
            return true;
        }
        return false;
    }

    onMouseMove(controls, x, y) {
        if (controls._state === Polygon.STATE.CHANGE_PIN_HEIGHT) {
            if (!this.enableMoveMarker) {
                return false;
            }
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);
            this.activePin.height += -panDelta.y * controls.camera.position.y / controls.canvas.height;
            panStart.copy(panEnd);
            return true;
        } else if (controls._state === Polygon.STATE.CHANGE_PIN_POSITION) {
            if (!this.enableMoveMarker) {
                return false;
            }
            MapUtility.rayCasterFromScreen(controls, x, y, picker);
            // TODO: Deprecated base plane
            const markerPosition = picker.intersectObjects(this._map.quadTree.tiles.children)[0].point;
            this.activePin.groundPosition = markerPosition.add(controls.camera.target);
            return true;
        }
        return false;
    }

    generateGrid(type: string, gridSpace?: number, angle?: number, speed?: number, minute?: number) {
        const target = this._map.camera.target;
        this.gridGenerateOffset.set(target.x, target.y, target.z);
        // Call C++ function to genreate flight grid
        if (type === 'opt') {
            if (speed) {
                optimizeGridCalculation.speed = speed;
            }
            if (minute) {
                optimizeGridCalculation.minute = minute;
            }
            const res = optimizeGridCalculation.genGridInsideBound(this.pinsCoordinate,
                this._map.vehicle.coordinate(), gridSpace);

            this.grids = res.map((x) => {
                return x.grid;
            });
            this.angles = res.map((x) => {
                return x.angle;
            });
        } else {
            if (speed) {
                gridcalculation.speed = speed;
            }
            if (minute) {
                gridcalculation.minute = minute;
            }
            this.grids = gridcalculation.genGridInsideBound(this.pinsCoordinate,
                this._map.vehicle.coordinate(), gridSpace, angle || 0);
        }
        // Redraw grid mesh
        // Remove exist mesh first
        if (this.gridMesh) {
            this.gridMesh.children.map((mesh) => {
                (mesh as THREE.Mesh).geometry.dispose();
                ((mesh as THREE.Mesh).material as Material).dispose();
            });
            this.gridMesh.children.length = 0;
            this._map.scene.remove(this.gridMesh);
        }
        // Define grid mesh as an array of consecutive line
        this.gridMesh = new THREE.Group();
        this._map.scene.add(this.gridMesh);
        // Create each grid from geneated data
        this.grids.forEach((grid) => {
            const lineGeometry = new THREE.Geometry();
            for (let i = 0; i < grid.length; i++) {
                // Passing Geocoordinate to 3D Point
                sphericalMercator.CartographicToPixel(grid[i], px);
                // Doubling point, so it's will render consecutive line
                const v = px.clone().sub(this.gridGenerateOffset);
                if (i !== 0) {
                    lineGeometry.vertices.push(v);
                }
                lineGeometry.vertices.push(v);
            }
            this.gridMesh.add(new THREE.LineSegments(
                lineGeometry,
                new THREE.LineBasicMaterial({
                    color: Math.random() * 0xffffff,
                    linewidth: 3,
                    transparent: true,
                    opacity: 0.8,
                }),
                // new THREE.LineBasicMaterial({ color: 0x00e500, linewidth: 3, transparent: true, opacity: 0.8 })
            ));
        });
        return this.grids;
    }

    get pinsCoordinate() {
        return this.pins.map((pin) => {
            return pin.coordinate();
        });
    }

    coordinate() {
        return QtPositioning.coordinate();
    }
    getScale() { return 1; }
    setScale(scale) { return; }
}
