import * as THREE from 'three';
import { Map3D } from '../Core/Map3D';
import { Cartesian } from '../Math/Cartesian';
import { sphericalMercator } from '../Utility/SphericalMercator';

const t = new Cartesian();
const s = new THREE.Vector3();
const corner = [[-1, -1], [-1, 1], [1, 1], [1, -1]];

export class Camera extends THREE.PerspectiveCamera {
    _map: Map3D;

    target = new Cartesian();
    _targetCartographic = QtPositioning.coordinate();

    _positionCartographic = QtPositioning.coordinate();

    _culledGroundPlane: Cartesian[];

    updatedLastFrame: boolean;
    // FIXME: Debug
    // geometry: THREE.Geometry;

    constructor(options) {
        super(70, options.canvas.width / options.canvas.height, 1 / 99, 12000000 / Math.sin(70 * Math.PI));

        this._map = options.map;

        this._targetCartographic = QtPositioning.coordinate();

        this._positionCartographic = QtPositioning.coordinate();
        this._culledGroundPlane = [new Cartesian(), new Cartesian(), new Cartesian(), new Cartesian()];
        this.updatedLastFrame = false;
        /**
         * FIXME:
         * Debuging mesh
         */
        // const material = new THREE.MeshBasicMaterial({
        //     wireframe: true,
        //     // opacity: 0,
        //     color: new THREE.Color(0xff0000),
        // });
        // this.geometry = new THREE.Geometry();
        // this.geometry.vertices = [
        //     new THREE.Vector3(),
        //     new THREE.Vector3(),
        //     new THREE.Vector3(),
        //     new THREE.Vector3(),
        // ];
        // this.geometry.faces = [
        //     new THREE.Face3(0, 1, 3),
        //     new THREE.Face3(1, 3, 2),
        // ];
        // this.geometry.computeFaceNormals();
        // const mesh = new THREE.Mesh(this.geometry, material);
        // this._map.scene.add(mesh);
    }
    setPosition(position) {
        if (!position) {
            throw new Error('No position provided');
        }
        // Partial set x, y, z of position
        this.position.x = position.x || this.position.x;
        this.position.y = position.y || this.position.y;
        this.position.z = position.z || this.position.z;
        sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);
        this.updatedLastFrame = true;
    }
    update() {
        // Update Cartographic position
        sphericalMercator.CartesianToCartographic(this.target, this._targetCartographic);
        t.addVectors((this.target as any), this.position);
        sphericalMercator.CartesianToCartographic(t, this._positionCartographic);
        this.updatedLastFrame = true;
        // Calculate ray direction at 4 corners of screen
        let scale;
        for (let i = 0; i < 4; i++) {
            t.set(corner[i][0], corner[i][1], 0.5).unproject(this).sub(this.position).normalize();
            // Case corner of camrea to over horizontal line direction from camera y axis will be positive
            // It will not be able to project plane so will clip with -0
            if (t.y >= 0) {
                t.y = -0.00001;
            }
            scale = this.position.y / t.y;
            s.subVectors(this.position, t.multiplyScalar(scale));
            this._culledGroundPlane[i].set(s.x + this.target.x, 0, s.z + this.target.z);
            // FIXME: Debugging
            // this.geometry.vertices[i].set(s.x, 0, s.z);
        }
        // FIXME: Debugging
        // this.geometry.verticesNeedUpdate = true;
    }

    get positionCartographic() {
        return this._positionCartographic;
    }

    get targetCartographic() {
        return this._targetCartographic;
    }

    get culledGroundPlane() {
        return this._culledGroundPlane;
    }
}
