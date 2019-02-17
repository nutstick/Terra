import * as THREE from 'three';
import { Map3D } from '../Core/Map3D';
import { MapSettings } from '../Core/MapSettings';
import { Cartesian } from '../Math/Cartesian';
import { Camera } from '../Renderer/Camera';
import { MapUtility } from '../Utility/MapUtility';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { OrbitConstraint } from './OrbitConstraint';

export interface OrbitControlsOptions {
  map: Map3D;
  eventSource: QtEventSource;
  canvas: QtCanvas;
}

function compare(modifiers) {
  if (typeof Qt === 'object') {
    return modifiers & Qt.ControlModifier;
  }

  return modifiers;
}

function getAutoRotationAngle(primitive: OrbitControls) {
  return ((2 * Math.PI) / 60 / 60) * primitive.autoRotateSpeed;
}

function getZoomScale(delta?: number) {
  delta = delta || 1;
  return Math.pow(0.999, delta);
}

const screenPosition = new THREE.Vector2();
const picker = new THREE.Raycaster();
const px = new THREE.Vector3();

function pickerFromScreen(primitive, x, y, p) {
  screenPosition.set(
    (x / primitive.canvas.width) * 2 - 1,
    -(y / primitive.canvas.height) * 2 + 1,
  );
  p.setFromCamera(screenPosition, primitive.camera);

  return p;
}

function contextmenu(event) {
  event.preventDefault();
}

export class OrbitControls extends THREE.EventDispatcher {
  static STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5,
  };
  static MODE = { NONE: -1, GUIDE: 0 };

  _map: Map3D;

  constraint: OrbitConstraint;
  eventSource: QtEventSource;
  canvas: QtCanvas;

  enabled: boolean;

  enableZoom: boolean;
  zoomSpeed: number;

  enableRotate: boolean;
  rotateSpeed: number;

  enablePan: boolean;
  keyPanSpeed: number;

  autoRotate: boolean;
  autoRotateSpeed: number;

  enableKeys: boolean;
  keys: { LEFT: any; UP: number; RIGHT: number; BOTTOM: number };
  mouseButtons: { ORBIT: number; ZOOM: number; PAN: number };

  _state: number;
  _lastClick: number;

  _isMouseDown: boolean;

  _mode: number;

  keyDown: any;

  zoom0: number;
  position0: THREE.Vector3;
  target0: Cartesian;

  dispose: () => void;

  constructor(options: OrbitControlsOptions) {
    super();

    this._map = options.map;

    this.constraint = new OrbitConstraint(
      this._map,
      this._map.camera,
      MapSettings.cameraDistance,
    );
    this.eventSource = options.eventSource;
    this.canvas = options.canvas;

    // Set to false to disable this control
    this.enabled = true;
    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 10;
    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    // Set to false to disable panning
    this.enablePan = true;
    this.keyPanSpeed = 5.0; // pixels moved per arrow key push
    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
    // Set to false to disable use of the keys
    this.enableKeys = true;
    // The four arrow keys
    this.keys =
      typeof Qt === 'object'
        ? {
            LEFT: Qt.LeftArrow,
            UP: Qt.UpArrow,
            RIGHT: Qt.RightArrow,
            BOTTOM: Qt.DownArrow,
          }
        : { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
    // Mouse buttons
    this.mouseButtons = {
      ORBIT: THREE.MOUSE.RIGHT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.LEFT,
    };
    /// /////////
    // internals
    const scope = this;
    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();
    const panStart = new THREE.Vector2();
    const panEnd = new THREE.Vector2();
    const panDelta = new THREE.Vector2();
    const dollyStart = new THREE.Vector2();
    const dollyEnd = new THREE.Vector2();
    const dollyDelta = new THREE.Vector2();
    /**
     * State
     */
    this._state = OrbitControls.STATE.NONE;
    this._lastClick = null;
    /**
     * Is mouse down
     * @type {boolean}
     */
    this._isMouseDown = false;
    this._mode = OrbitControls.MODE.NONE;

    const currentPin = null;
    let intersected = null;
    // set start position
    // TODO: using property instead of location
    // setView(this, location.hash)

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.camera.position.clone();
    this.zoom0 = this.camera.zoom;

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    const pan = (deltaX, deltaY) => {
      scope.constraint.pan(
        deltaX,
        deltaY,
        scope.canvas.width,
        scope.canvas.height,
      );
    };

    // this.moveTo = function (coords, currentHeight) {
    //     this.target.copy(coords);
    //     this.camera.position.copy({x: coords.x, y: currentHeight, z: coords.z});
    //     // TIMER: timer.
    //     if (typeof Qt === 'object') {
    //         timer.setTimeout(function () { map.quadTree.needUpdate = true; }, 10);
    //     } else {
    //         setTimeout(function () { map.quadTree.needUpdate = true; }, 10);
    //     }
    // };

    function onMouseDown(x, y, button, modifiers) {
      if (scope.enabled === false) {
        return;
      }
      if (button === scope.mouseButtons.ORBIT || compare(modifiers)) {
        if (scope.enableRotate === false) {
          return;
        }
        scope._state = OrbitControls.STATE.ROTATE;
        rotateStart.set(x, y);
      } else if (button === scope.mouseButtons.ZOOM) {
        if (scope.enableZoom === false) {
          return;
        }
        scope._state = OrbitControls.STATE.DOLLY;
        dollyStart.set(x, y);
      } else if (button === scope.mouseButtons.PAN) {
        // Checking mouse down on marker
        // TODO: Use mission method to handle object
        if (!scope._map.currentMission.onMouseDown(scope, x, y, button)) {
          panStart.set(x, y);
          scope._lastClick = Date.now();
        }
      }
      scope._isMouseDown = true;
    }
    function onWebMouseDown(event) {
      event.preventDefault();
      onMouseDown(event.clientX, event.clientY, event.button, event.ctrlKey);
    }

    function onMouseMove(x, y) {
      if (scope.enabled === false) {
        return;
      }
      const now = Date.now();
      if (scope._lastClick) {
        panEnd.set(x, y);
        panDelta.subVectors(panEnd, panStart);
        if (
          scope._isMouseDown &&
          now - scope._lastClick <= 500 &&
          Math.abs(panDelta.x) + Math.abs(panDelta.y) > 10 &&
          scope.enablePan
        ) {
          if (scope._mode === OrbitControls.MODE.GUIDE) {
            scope.target0.set(scope.target.x, 0, scope.target.z);
            scope.constraint.target = scope.target0;
            scope._mode = OrbitControls.MODE.NONE;
          }
          scope._state = OrbitControls.STATE.PAN;
          scope._lastClick = null;
        } else if (now - scope._lastClick > 500) {
          scope._lastClick = null;
        }
      }
      if (scope._state === OrbitControls.STATE.NONE) {
        // Hovering Rendering Object
        MapUtility.rayCasterFromScreen(scope, x, y, picker);
        const intersects = picker.intersectObjects(
          scope._map.currentMission.interactableObjects(),
          true,
        );
        if (intersects.length > 0) {
          const targetObject = intersects[0].object;
          if (targetObject !== intersected) {
            if (intersected) {
              intersected.material.opacity = intersected.currentOpacity;
            }
            intersected = targetObject;
            intersected.currentOpacity = intersected.material.opacity;
            intersected.material.opacity = 1.0;
          }
        } else if (intersected) {
          intersected.material.opacity = intersected.currentOpacity;
          delete intersected.currentOpacity;
          intersected = null;
        }
      } else if (scope._state === OrbitControls.STATE.ROTATE) {
        if (scope.enableRotate === false) {
          return;
        }
        rotateEnd.set(x, y);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        // rotating across whole screen goes 360 degrees around
        scope.constraint.rotateLeft(
          ((2 * Math.PI * rotateDelta.x) / scope.canvas.width) *
            scope.rotateSpeed,
        );
        // rotating up and down along whole screen attempts to go 360, but limited to 180
        scope.constraint.rotateUp(
          ((2 * Math.PI * rotateDelta.y) / scope.canvas.height) *
            scope.rotateSpeed,
        );
        rotateStart.copy(rotateEnd);
      } else if (scope._state === OrbitControls.STATE.DOLLY) {
        if (scope.enableZoom === false) {
          return;
        }
        dollyEnd.set(x, y);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
          scope.constraint.dollyIn(getZoomScale());
        } else if (dollyDelta.y < 0) {
          scope.constraint.dollyOut(getZoomScale());
        }
        dollyStart.copy(dollyEnd);
      } else if (scope._state === OrbitControls.STATE.PAN) {
        if (scope.enablePan === false) {
          return;
        }
        panEnd.set(x, y);
        panDelta.subVectors(panEnd, panStart);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
      } else if (!scope._map.currentMission.onMouseMove(scope, x, y)) {
        // TODO:
      }
      if (scope._state !== OrbitControls.STATE.NONE) {
        scope.update();
      }
    }
    function onWebMouseMove(event) {
      event.preventDefault();
      onMouseMove(event.clientX, event.clientY);
    }

    function onMouseUp(x, y) {
      if (scope.enabled === false) {
        return;
      }
      // if (!scope._isMouseDown) return;
      scope._isMouseDown = false;
      scope._state = OrbitControls.STATE.NONE;
    }
    function onWebMouseUp(event) {
      event.preventDefault();
      onMouseUp(event.clientX, event.clientY);
    }

    function onMouseWheel(x, y, wheelX, wheelY) {
      // if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;
      const delta = wheelY;
      scope.constraint.dollyOut(getZoomScale(delta));
      scope.update();
      // scope.dispatchEvent(startEvent);
      // scope.dispatchEvent(endEvent);
      // off-center zooming :D
      if (scope.camera.position.y >= scope.maxDistance) {
        return;
      }
      const direction = -delta * 0.001001001;
      pan(
        direction * (x - scope.canvas.width / 2),
        direction * (y - scope.canvas.height / 2),
      );
    }
    function onWebMouseWheel(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.wheelDelta !== undefined) {
        // WebKit / Opera / Explorer 9
        onMouseWheel(event.clientX, event.clientY, 0, event.wheelDelta);
      } else if (event.detail !== undefined) {
        // Firefox
        onMouseWheel(event.clientX, event.clientY, 0, -event.detail);
      }
    }
    function onKeyDown(event) {
      if (
        scope.keyDown ||
        scope.enabled === false ||
        scope.enableKeys === false ||
        scope.enablePan === false
      ) {
        return;
      }
      scope.keyDown = setInterval(() => { // TODO: timer.
        switch (event.key) {
          case scope.keys.UP:
            pan(0, scope.keyPanSpeed);
            scope.update();
            break;
          case scope.keys.BOTTOM:
            pan(0, -scope.keyPanSpeed);
            scope.update();
            break;
          case scope.keys.LEFT:
            pan(scope.keyPanSpeed, 0);
            scope.update();
            break;
          case scope.keys.RIGHT:
            pan(-scope.keyPanSpeed, 0);
            scope.update();
            break;
        }
      }, 10);
    }
    function onKeyUp(event) {
      // TIMER: timer.
      if (typeof Qt === 'object') {
        timer.clearInterval(scope.keyDown);
      } else {
        clearInterval(scope.keyDown);
      }
      scope.keyDown = false;
    }
    function touchstart(event) {
      if (scope.enabled === false) {
        return;
      }
      switch (event.touches.length) {
        case 1: // one-fingered touch: rotate
          if (scope.enableRotate === false) {
            return;
          }
          scope._state = OrbitControls.STATE.TOUCH_ROTATE;
          rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
          break;
        case 2: // two-fingered touch: dolly
          if (scope.enableZoom === false) {
            return;
          }
          scope._state = OrbitControls.STATE.TOUCH_DOLLY;
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          dollyStart.set(0, distance);
          break;
        case 3: // three-fingered touch: pan
          if (scope.enablePan === false) {
            return;
          }
          scope._state = OrbitControls.STATE.TOUCH_PAN;
          panStart.set(event.touches[0].pageX, event.touches[0].pageY);
          break;
        default:
          scope._state = OrbitControls.STATE.NONE;
      }
    }
    function touchmove(event) {
      if (scope.enabled === false) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const element =
        (scope._map._renderer.domElement as any) === document
          ? (scope._map._renderer.domElement as any).body
          : scope._map._renderer.domElement;
      switch (event.touches.length) {
        case 1: // one-fingered touch: rotate
          if (scope.enableRotate === false) {
            return;
          }
          if (scope._state !== OrbitControls.STATE.TOUCH_ROTATE) {
            return;
          }
          rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          rotateDelta.subVectors(rotateEnd, rotateStart);
          // rotating across whole screen goes 360 degrees around
          scope.constraint.rotateLeft(
            ((2 * Math.PI * rotateDelta.x) / element.clientWidth) *
              scope.rotateSpeed,
          );
          // rotating up and down along whole screen attempts to go 360, but limited to 180
          scope.constraint.rotateUp(
            ((2 * Math.PI * rotateDelta.y) / element.clientHeight) *
              scope.rotateSpeed,
          );
          rotateStart.copy(rotateEnd);
          scope.update();
          break;
        case 2: // two-fingered touch: dolly
          if (scope.enableZoom === false) {
            return;
          }
          if (scope._state !== OrbitControls.STATE.TOUCH_DOLLY) {
            return;
          }
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          dollyEnd.set(0, distance);
          dollyDelta.subVectors(dollyEnd, dollyStart);
          if (dollyDelta.y > 0) {
            scope.constraint.dollyOut(getZoomScale());
          } else if (dollyDelta.y < 0) {
            scope.constraint.dollyIn(getZoomScale());
          }
          dollyStart.copy(dollyEnd);
          scope.update();
          break;
        case 3: // three-fingered touch: pan
          if (scope.enablePan === false) {
            return;
          }
          if (scope._state !== OrbitControls.STATE.TOUCH_PAN) {
            return;
          }
          panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          panDelta.subVectors(panEnd, panStart);
          pan(panDelta.x, panDelta.y);
          panStart.copy(panEnd);
          scope.update();
          break;
        default:
          scope._state = OrbitControls.STATE.NONE;
      }
    }
    function touchend() {
      if (scope.enabled === false) {
        return;
      }
      // scope.dispatchEvent(endEvent);
      scope._state = OrbitControls.STATE.NONE;
    }
    this.dispose = function() {
      if (typeof Qt === 'object') {
        scope.eventSource.mouseDown.disconnect(onMouseDown);
        scope.eventSource.mouseMove.disconnect(onMouseMove);
        this.eventSource.mouseMove.disconnect(onMouseUp);
        scope.eventSource.mouseWheel.disconnect(onMouseWheel);
        scope.eventSource.keyDown.disconnect(onKeyDown);
      } else {
        this._map._renderer.domElement.removeEventListener(
          'contextmenu',
          contextmenu,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'mousedown',
          onWebMouseDown,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'mouseup',
          onWebMouseUp,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'mousemove',
          onWebMouseMove,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'mousewheel',
          onWebMouseWheel,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'touchstart',
          touchstart,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'touchend',
          touchend,
          false,
        );
        this._map._renderer.domElement.removeEventListener(
          'touchmove',
          touchmove,
          false,
        );
      }
    };
    // this.domElement.addEventListener( 'contextmenu', contextmenu, false );
    if (typeof Qt === 'object') {
      this.eventSource.mouseDown.connect(onMouseDown);
      this.eventSource.mouseMove.connect(onMouseMove);
      this.eventSource.mouseUp.connect(onMouseUp);
      this.eventSource.mouseWheel.connect(onMouseWheel);
      this.eventSource.keyDown.connect(onKeyDown);
      this.eventSource.keyUp.connect(onKeyUp);
    } else {
      this._map._renderer.domElement.addEventListener(
        'mousedown',
        onWebMouseDown,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'mousemove',
        onWebMouseMove,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'mouseup',
        onWebMouseUp,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'mousewheel',
        onWebMouseWheel,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'touchstart',
        touchstart,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'touchend',
        touchend,
        false,
      );
      this._map._renderer.domElement.addEventListener(
        'touchmove',
        touchmove,
        false,
      );
    }
    // force an update at start
    this.update();
  }

  getPolarAngle() {
    return this.constraint.getPolarAngle();
  }
  getAzimuthalAngle() {
    return this.constraint.getAzimuthalAngle();
  }
  update() {
    // Pause camera when debuging
    if (this._map.quadTree && this._map.quadTree._debug.suspendLodUpdate) {
      return;
    }
    if (this.autoRotate && this._state === OrbitControls.STATE.NONE) {
      this.constraint.rotateLeft(getAutoRotationAngle(this));
    }
    if (this.constraint.update() === true) {
      // this.dispatchEvent(changeEvent);
    }
  }
  reset() {
    this._state = OrbitControls.STATE.NONE;
    this.camera.target.copy(this.target0);
    this.camera.position.copy(this.position0);
    this.camera.zoom = this.zoom0;
    this.camera.updateProjectionMatrix();
    // this.dispatchEvent(changeEvent);
    this.update();
  }
  /**
   * Set camrea view
   * @param {Cartographic} position - Cartographic position
   * @param {number} zoom - Zoom distance
   * @param {number} duration
   */
  setView(position: Cartographic, zoom: number, duration?: number) {
    // TODO: duration as animation
    duration = duration || 0;
    sphericalMercator.CartographicToPixel(position, px);
    // FIXME: Y = elevation data
    this.constraint.camera.target.set(px.x, 0, px.z);
    this.constraint.targetDistance =
      Math.pow(0.5, zoom) * MapSettings.cameraDistance;
    this.update();
    // camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    // this.quadTree.needUpdate = true;
  }
  guide(vehicle) {
    this._mode = OrbitControls.MODE.GUIDE;
    this.target0 = this.constraint.target.clone();
    this.constraint.target = vehicle.position;
    this.constraint.targetDistance = vehicle.height * 2;
    this.update();
  }

  get camera() {
    return this.constraint.camera;
  }
  get target() {
    return this.constraint.target;
  }
  get minDistance() {
    return this.constraint.minDistance;
  }
  set minDistance(value) {
    this.constraint.minDistance = value;
  }
  get maxDistance() {
    return this.constraint.maxDistance;
  }
  set maxDistance(value) {
    this.constraint.maxDistance = value;
  }
  // get minZoom() { return this.constraint.minZoom; }
  // set minZoom(value) { this.constraint.minZoom = value; }
  // get maxZoom() { return this.constraint.maxZoom; }
  // set maxZoom(value) { this.constraint.maxZoom = value; }
  get minPolarAngle() {
    return this.constraint.minPolarAngle;
  }
  set minPolarAngle(value) {
    this.constraint.minPolarAngle = value;
  }
  get maxPolarAngle() {
    return this.constraint.maxPolarAngle;
  }
  set maxPolarAngle(value) {
    this.constraint.maxPolarAngle = value;
  }
  get minAzimuthAngle() {
    return this.constraint.minAzimuthAngle;
  }
  set minAzimuthAngle(value) {
    this.constraint.minAzimuthAngle = value;
  }
  get maxAzimuthAngle() {
    return this.constraint.maxAzimuthAngle;
  }
  set maxAzimuthAngle(value) {
    this.constraint.maxAzimuthAngle = value;
  }
  get enableDamping() {
    return this.constraint.enableDamping;
  }
  set enableDamping(value) {
    this.constraint.enableDamping = value;
  }
  get dampingFactor() {
    return this.constraint.dampingFactor;
  }
  set dampingFactor(value) {
    this.constraint.dampingFactor = value;
  }
}
