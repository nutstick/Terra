import * as THREE from 'three';
import { Cartesian } from '../Math/Cartesian';
import { MapUtility } from '../Utility/MapUtility';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { Mission } from './Mission';
import { RenderingObject } from './RenderingObject';

export interface PinOptions {
    mission: Mission;
    index: number;
    position: Cartographic | Cartesian;
}

export interface Head extends THREE.Mesh {
    pin: Pin;
    geometry: THREE.Geometry;
    material: THREE.Material;
}

export interface Arrow extends THREE.Mesh {
    pin: Pin;
    geometry: THREE.Geometry;
    material: THREE.Material;
}

export class Pin extends RenderingObject {
    _mission: Mission;
    _index: number;

    head: Head;
    arrow: Arrow;
    line: THREE.LineSegments;

    group: THREE.Group;

    _rGPosition: THREE.Vector3;
    _rPosition: THREE.Vector3;
    _position: THREE.Vector3;
    _coordinate: Cartographic;

    lastScale: number;

    constructor(options: PinOptions) {
        super();
        this._mission = options.mission;
        this._index = options.index;

        const headGeometry = new THREE.CylinderGeometry(3, 3, 8, 8, 1);
        // Recalculate centroid of mesh offset by 8
        for (let i = 0, len = headGeometry.vertices.length; i < len; i++) {
            headGeometry.vertices[i].y += 8;
        }

        this.head = (new THREE.Mesh(
            headGeometry,
            new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true }),
        ) as Head);
        this.head.name = 'Head';
        this.head.pin = this;

        const arrowGeometry = new THREE.CylinderGeometry(4, 0, 6, 6, 1);
        // Recalculate centroid
        for (let i_ = 0, len_ = arrowGeometry.vertices.length; i_ < len_; i_++) {
            arrowGeometry.vertices[i_].y += 3;
        }
        arrowGeometry.computeBoundingSphere();

        this.arrow = (new THREE.Mesh(
            arrowGeometry,
            new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true }),
        ) as Arrow);
        this.arrow.name = 'Arrow';
        this.arrow.pin = this;

        const lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(this.arrow.position);
        lineGeometry.vertices.push(this.head.position);

        this.line = new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 }),
        );
        this.line.name = 'Line';
        /**
         * Pack of all mesh in pin (head, line, arrow)
         * @type {THREE.Group}
         */
        this.group = new THREE.Group();
        this.group.add(this.head);
        this.group.add(this.line);
        this.group.add(this.arrow);
        this.group.name = 'Pin';
        // TODO: Map should have addRenderingObject function instead of direct access to scene
        this._mission._map.scene.add(this.group);

        this._rGPosition = this.arrow.position;
        this._rPosition = this.head.position;

        // TODO: Can it be Carsetian
        this._position = new THREE.Vector3();
        this._coordinate = QtPositioning.coordinate();
        // Initialize pin position
        this.position = options.position;
        /**
         * Last move scale of pin
         * @type {number}
         */
        // TODO: lastScale inside mission or map so that no need to calculate on all pin
        this.lastScale = 1.0;
        // Add Target Subscribe to this object
        this._mission._map.addSubscribeObject(this);
    }
    /**
     * Free memory and remove pin from rendering
     */
    dispose() {
        this.group.remove(this.head);
        this.group.remove(this.line);
        this._mission._map.removeSubscribeObject(this);
        this._mission._map.scene.remove(this.group);
        this._mission = undefined;
        this.group = undefined;
        // Clear Meshes
        this.head.geometry.dispose();
        this.head.material.dispose();
        this.head = undefined;
        this.line.geometry.dispose();
        this.line.material.dispose();
        this.line = undefined;
        this.arrow.geometry.dispose();
        this.arrow.material.dispose();
        this.arrow = undefined;
        this._rGPosition = undefined;
        this._rPosition = undefined;
        this._position = undefined;
    }
    updateTarget(target) {
        // Update rendering position
        this._rPosition.subVectors(this._position, target);
        // TODO: elevation projection instead of 0
        this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
        (this.line.geometry as THREE.Geometry).verticesNeedUpdate = true;
    }

    get position() { return this._position; }
    set position(p: any) {
        if (!p) {
            this._position.y = MapUtility.tenMeters();
        } else {
            // Case position is a QtPositioning.coordiante
            if (p.longitude) {
                sphericalMercator.CartographicToPixel(p, this._position);
            } else {
                this._position.copy(p);
                // Default height is 10 meters
                this._position.y = this._position.y || MapUtility.tenMeters();
            }
        }
        // Update rendering position
        this.updateTarget(this._mission._map.camera.target);

        this._mission.updatePin(this._index);
    }

    get groundPosition() { return new THREE.Vector3(this._position.x, 0, this._position.y); }
    set groundPosition(p: any) {
        // Case position is a QtPositioning.coordiante
        if (p.longitude) {
            // TODO: Ground
            sphericalMercator.CartographicToPixel(p, this._position);
            this._position.y = 0;
        } else {
            this._position.x = p.x;
            this._position.z = p.z;
        }

        this.updateTarget(this._mission._map.camera.target);

        this._mission.updatePin(this._index);
    }

    coordinate() {
        sphericalMercator.PixelToCartographic(this._position, this._coordinate);
        return this._coordinate;
    }

    get height() { return this._position.y; }
    set height(h) {
        this._position.y = h;

        this.updateTarget(this._mission._map.camera.target);

        this._mission.updatePin(this._index);
    }

    getScale() { return this.lastScale; }
    setScale(s: number) {
        if (this.lastScale === s) {
            return;
        }

        this.head.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
        this.arrow.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
        this.lastScale = s;
    }
}
