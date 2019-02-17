import * as THREE from 'three';
import { Map3D } from '../Core/Map3D';
import { MapSettings } from '../Core/MapSettings';
import { Cartesian } from '../Math/Cartesian';
import { Camera } from './Camera';

const zero = new THREE.Vector3();
// so camera.up is the orbit axis
let quat = new THREE.Quaternion();
let quatInverse = new THREE.Quaternion();
const EPS = 0.000001;
const v = new THREE.Vector3();

export class OrbitConstraint {
  map: Map3D;
  camera: Camera;
  targetDistance: number;

  minDistance: number;
  maxDistance: number;

  minPolarAngle: number = 0.0;
  // maxPolarAngle: number = 0.48 * Math.PI;
  maxPolarAngle: number = 0.3 * Math.PI;

  minAzimuthAngle: number = -Infinity;
  maxAzimuthAngle: number = Infinity;

  enableDamping: boolean = true;
  dampingFactor: number = 0.75;
  maxClickTimeInterval: number = 500;

  theta: number = 0.0;
  phi: number = 0.0;
  thetaDelta: number = 0.0;
  phiDelta: number = 0.0;

  scale: number = 1.0;

  panOffset: THREE.Vector3 = new THREE.Vector3();
  zoomChanged: boolean = false;

  lastPosition: THREE.Vector3 = new THREE.Vector3();
  lastQuaternion: THREE.Quaternion = new THREE.Quaternion();

  constructor(map: Map3D, camera: Camera, targetDistance: number) {
    this.map = map;
    /**
     * @type Camera
     */
    this.camera = camera;
    /**
     * @type number
     */
    this.targetDistance = targetDistance;

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = MapSettings.maxCameraDistance;

    quat = quat.setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
    quatInverse = quat.clone().inverse();
  }

  getPolarAngle() {
    return this.phi;
  }

  getAzimuthalAngle() {
    return this.theta;
  }
  rotateLeft(angle) {
    this.thetaDelta -= angle;
    // TODO:
    // compass.update();
  }
  rotateUp(angle) {
    this.phiDelta -= angle;
    // TODO:
    // compass.update();
  }

  panLeft(distance) {
    const te = this.camera.matrix.elements;
    // get X column of matrix
    v.set(te[0], te[1], te[2]);
    v.multiplyScalar(-distance);
    this.panOffset.add(v);
  }
  // pass in distance in world space to move up
  panUp(distance) {
    const te = this.camera.matrix.elements;
    // get Y column of matrix
    v.set(te[4], /* te[ 5 ] */ 0, te[6]);
    v.multiplyScalar(distance);
    this.panOffset.add(v);
  }
  // pass in x,y of change desired in pixel space,
  // right and down are positive
  pan(deltaX, deltaY, screenWidth, screenHeight) {
    // half of the fov is center to top of screen
    const t =
      this.targetDistance * Math.tan(((this.camera.fov / 2) * Math.PI) / 180.0);
    // we actually don't use screenWidth, since perspective camera is fixed to screen height
    this.panLeft((2 * deltaX * t) / screenHeight);
    this.panUp((2 * deltaY * t) / screenHeight);
  }

  dollyIn(dollyScale) {
    this.scale /= dollyScale;
  }
  dollyOut(dollyScale) {
    this.scale *= dollyScale;
  }

  /**
   * Update camera constrain
   * @returns {boolean}
   */
  update() {
    const offset = this.camera.position;
    const target = this.camera.target;

    this.theta += this.thetaDelta;
    this.phi += this.phiDelta;
    this.targetDistance = this.targetDistance * this.scale;
    // Restrict theta to be between desired limits
    this.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, this.theta),
    );
    // Restrict phi to be between desired limits
    this.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.phi),
    );
    // Restrict phi to be betwee EPS and PI-EPS
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
    // Restrict radius to be between desired limits
    this.targetDistance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.targetDistance),
    );

    // Move target to panned location
    target.add(this.panOffset);
    offset.x = this.targetDistance * Math.sin(this.phi) * Math.sin(this.theta);
    offset.y = this.targetDistance * Math.cos(this.phi);
    offset.z = this.targetDistance * Math.sin(this.phi) * Math.cos(this.theta);
    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse);
    this.camera.lookAt(zero);
    // Update camera matrix
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld(true);
    this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
    this.camera.update();
    // Update subscribe object
    this.map._subscribeObjects.forEach(obj => {
      obj.updateTarget(target);
    });
    if (this.enableDamping === true) {
      this.thetaDelta *= 1.0 - this.dampingFactor;
      this.phiDelta *= 1.0 - this.dampingFactor;
    } else {
      this.thetaDelta = 0.0;
      this.phiDelta = 0.0;
    }
    this.scale = 1.0;
    this.panOffset.set(0, 0, 0);
    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8
    const t = new THREE.Vector3();
    if (
      this.lastPosition.distanceToSquared(
        t.addVectors(this.camera.position, this.camera.target as any),
      ) > EPS ||
      8 * (1 - this.lastQuaternion.dot(this.camera.quaternion)) > EPS ||
      this.zoomChanged
    ) {
      this.lastPosition.copy(t);
      this.lastQuaternion.copy(this.camera.quaternion);
      this.zoomChanged = false;
      if (this.map.quadTree) {
        this.map.quadTree.needUpdate = true;
      }
      return true;
    }
    return false;
  }

  get target() {
    return this.camera.target;
  }
  set target(target) {
    this.camera.target = target;
  }
}
