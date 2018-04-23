import * as THREE from 'three';
import { Map3D } from '../Core/Map3D';
import { Cartesian } from '../Math/Cartesian';
import { MapUtility } from '../Utility/MapUtility';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { RenderingObject } from './RenderingObject';

export interface VehicleOptions {
    map: Map3D;
    position?: Cartographic | Cartesian;
}

export interface Head extends THREE.Mesh {
    geometry: THREE.Geometry;
    material: THREE.Material;
}

export class Vehicle extends RenderingObject {
    _map: Map3D;

    head: Head;
    line: THREE.LineSegments;

    group: THREE.Group;

    _headAngle: number;
    _rGPosition: THREE.Vector3;
    _rPosition: THREE.Vector3;
    _position: THREE.Vector3;
    _coordinate: Cartographic;

    lastScale: number;

    constructor(options: VehicleOptions) {
        super();

        this._map = options.map;

        const headGeometry = new THREE.Geometry();
        const radius = 7.5;
        const x = radius * 2.0 / 3.0;
        const offset = 0; // radius / 3.0;
        headGeometry.vertices = [
            new THREE.Vector3(0.0, 0.0, 0.0 + offset),
            new THREE.Vector3(-x * Math.sqrt(3), x, x + offset),
            new THREE.Vector3(x * Math.sqrt(3), x, x + offset),
            new THREE.Vector3(0.0, x * 2.0 / 3.0, 0.0 + offset),
            new THREE.Vector3(0.0, 0.0, -2 * x + offset),
        ];
        headGeometry.faces = [
            new THREE.Face3(0, 2, 3),
            new THREE.Face3(0, 3, 1),
            new THREE.Face3(0, 4, 2),
            new THREE.Face3(0, 1, 4),
            new THREE.Face3(3, 4, 1),
            new THREE.Face3(3, 2, 4),
        ];
        headGeometry.computeFaceNormals();
        headGeometry.rotateX(10 / 180 * Math.PI);
        /**
         * Pin's head mesh
         * @type {THREE.Mesh}
         */
        this.head = (new THREE.Mesh(
            headGeometry,
            new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true }),
        ) as Head);
        this.head.name = 'Head';
        /**
         * Line between head and arrow geometry
         * @type {THREE.Geometry}
         */
        const lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(new THREE.Vector3());
        lineGeometry.vertices.push(this.head.position);
        /**
         * ine between head and arrow
         * @type {THREE.LineSegments}
         */
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
        this.group.name = 'Vehicle';
        options.map.scene.add(this.group);
        // var box = new THREE.BoxHelper(this.group, 0xffff00);
        // options.map.scene.add(box);
        /**
         * Rendered Point at Ground
         * @type {THREE.Vector3}
         * @private
         */
        this._rGPosition = (this.line.geometry as THREE.Geometry).vertices[0];
        /**
         * Rendered Point
         * @type {THREE.Vector3}
         * @private
         */
        this._rPosition = this.head.position;
        // TODO: Can it be Carsetian
        /**
         * Position
         * @type {THREE.Vector3}
         * @private
         */
        this._position = new THREE.Vector3();
        this._coordinate = QtPositioning.coordinate();
        /**
         * Head angle from North (0, -1, 0)
         * @type {number}
         * @private
         */
        this._headAngle = 0.0;
        // Initialize pin position
        if (options.position) {
            this.position = options.position;
        }
        /**
         * Scale
         * @type {number}
         */
        this.lastScale = 1.0;
        // Add Target Subscribe to this object
        options.map.addSubscribeObject(this);
    }
    /**
     * Free memory and remove vehicle from rendering
     */
    dispose() {
        // https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js#L397
        this.group.remove(this.head);
        this.group.remove(this.line);
        this._map.removeSubscribeObject(this);
        this._map.scene.remove(this.group);
        this._map = undefined;
        this.group = undefined;
        this.head.geometry.dispose();
        this.head.material.dispose();
        this.head = undefined;
        this.line.geometry.dispose();
        this.line.material.dispose();
        this.line = undefined;
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

        // Restrict position above ground only
        this._position.y = Math.max(this._position.y, 0);

        // Update rendering position
        // TODO: Is this._map needs
        this._rPosition.subVectors(this._position, (this._map.camera.target as any));
        // TODO: elevation projection instead of 0
        this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);

        (this.line.geometry as THREE.Geometry).verticesNeedUpdate = true;

        this._map.cameraController.update();
    }

    coordinate() {
        sphericalMercator.PixelToCartographic(this._position, this._coordinate);
        return this._coordinate;
    }

    get height() { return this._position.y; }
    set height(h) {
        this._position.y = h;
    }

    get headAngle() {
        return -this._headAngle * 180 / Math.PI;
    }
    set headAngle(angle) {
        const angle_ = -angle * Math.PI / 180;
        this.head.geometry.rotateY(angle_ - this._headAngle);
        this._headAngle = angle_;
    }

    getScale() { return this.lastScale; }
    setScale(s: number) {
        if (this.lastScale === s) {
            return;
        }

        this.head.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
        this.lastScale = s;
    }
}
