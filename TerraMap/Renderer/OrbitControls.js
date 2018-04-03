var OrbitConstraint = require('./OrbitConstraint');
var MapSettings = require('../Core/MapSettings');

function compare (modifiers) {
    if (typeof Qt === 'object') {
        return modifiers & Qt.ControlModifier;
    }

    return modifiers;
}

/**
 * @param {Object} options
 * @param {TerrainMap} options.map
 */
function OrbitControls (options) {
    if (!options) throw new Error('No option provided');
    if (!options.map) throw new Error('No options.map provided');
    if (!options.map.camera) throw new Error('No options.map.camera provided');
    if (!options.eventSource) throw new Error('No options.eventSource provided');
    if (!options.canvas) throw new Error('No options.canvas provided');

    /**
     * @type TerrainMap
     */
    this._map = options.map;
    this.constraint = new OrbitConstraint(this._map, this._map.camera, MapSettings.cameraDistance);

    this.eventSource = options.eventSource;
    this.canvas = options.canvas;

    // Set to false to disable this control
    this.enabled = true;

    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 50;

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

    // Set to false to disable marker modifiered
    this.enableMoveMarker = true;

    // The four arrow keys
    this.keys = typeof Qt === 'object'
        ? { LEFT: Qt.LeftArrow, UP: Qt.UpArrow, RIGHT: Qt.RightArrow, BOTTOM: Qt.DownArrow }
        : { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    /// /////////
    // internals

    var scope = this;
    var lastClick;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var currentPin = null;

    this._state = OrbitControls.STATE.NONE;

    // set start position
    // TODO: using property instead of location
    // setView(this, location.hash)

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.camera.position.clone();
    this.zoom0 = this.camera.zoom;

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    var pan = function (deltaX, deltaY) {
        this.constraint.pan(deltaX, deltaY, scope.canvas.width, scope.canvas.height);
    };
    // pan(100,100000)

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

    function onMouseDown (x, y, button, modifiers) {
        if (scope.enabled === false) return;

        if (button === scope.mouseButtons.ORBIT || compare(modifiers)) {
            if (scope.enableRotate === false) return;

            scope._state = OrbitControls.STATE.ROTATE;

            rotateStart.set(x, y);
        } else if (button === scope.mouseButtons.ZOOM) {
            if (scope.enableZoom === false) return;

            scope._state = OrbitControls.STATE.DOLLY;

            dollyStart.set(x, y);
        } else if (button === scope.mouseButtons.PAN) {
            // Checking mouse down on marker
            // TODO: Use mission method to handle object
            var selectedObject = scope._map.mouseDownOnMarkers(pickerFromScreen(x, y, picker));

            panStart.set(x, y);

            var now = Date.now();
            if (selectedObject && selectedObject.name === 'Head') {
                currentPin = selectedObject.pin;

                scope._state = OrbitControls.STATE.CHANGE_PIN_HEIGHT;
            } else if (selectedObject && selectedObject.name === 'Arrow') {
                currentPin = selectedObject.pin;

                scope._state = OrbitControls.STATE.CHANGE_PIN_POSITION;
            } else if (lastClick && now - lastClick < scope.constraint.maxClickTimeInterval && scope.enableMoveMarker === true) {
                currentPin = scope._map.addPin(pickerFromScreen(x, y, picker));

                scope._state = OrbitControls.STATE.CHANGE_PIN_HEIGHT;
            } else if (scope.enablePan === true) {
                scope._state = OrbitControls.STATE.PAN;
            }

            lastClick = now;
        }

        if (scope._state !== OrbitControls.STATE.STATE.NONE) {
            if (typeof Qt === 'object') {
                // eventSource.mouseMove.connect(onMouseMove)
                scope.eventSource.mouseUp.connect(onMouseUp);
            } else {
                // document.addEventListener( 'mousemove', onMouseMove_, false );
                scope._map._renderer.addEventListener('mouseup', scope.onWebMouseUp, false);
            }
            scope.dispatchEvent(startEvent);
        }
    }

    function onWebMouseDown (event) {
        event.preventDefault();

        onMouseDown(event.clientX, event.clientY, event.button, event.ctrlKey);
    }

    function onMouseMove (x, y) {
        if (scope.enabled === false) return;

        if (scope._state === OrbitControls.STATE.NONE) {
            // FIXME: Debug
            // pickerFromScreen(x, y, picker);
            // console.log(picker.intersectObjects(map.quadTree.tiles.children).map(function (k) { return k.object.tile.stringify; }));
        } else if (scope._state === OrbitControls.STATE.ROTATE) {
            if (scope.enableRotate === false) return;

            rotateEnd.set(x, y);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            // rotating across whole screen goes 360 degrees around
            scope.constraint.rotateLeft(2 * Math.PI * rotateDelta.x / scope.canvas.width * scope.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.constraint.rotateUp(2 * Math.PI * rotateDelta.y / scope.canvas.height * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);
        } else if (scope._state === OrbitControls.STATE.DOLLY) {
            if (scope.enableZoom === false) return;

            dollyEnd.set(x, y);
            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {
                scope.constraint.dollyIn(getZoomScale());
            } else if (dollyDelta.y < 0) {
                scope.constraint.dollyOut(getZoomScale());
            }

            dollyStart.copy(dollyEnd);
        } else if (scope._state === OrbitControls.STATE.PAN) {
            if (scope.enablePan === false) return;
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);
        } else if (scope._state === OrbitControls.STATE.CHANGE_PIN_HEIGHT) {
            if (scope.enableMoveMarker === false) return;
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);

            currentPin.offsetHeight(-panDelta.y * scope.camera.position.y / scope.canvas.height);

            panStart.copy(panEnd);
        } else if (scope._state === OrbitControls.STATE.CHANGE_PIN_POSITION) {
            if (scope.enableMoveMarker === false) return;

            var markerPosition = pickerFromScreen(x, y, picker).intersectObject(scope._map.basePlane)[0].point;
            currentPin.setPosition(markerPosition);
        }

        if (scope._state !== OrbitControls.STATE.NONE) scope.update();
    }

    function onWebMouseMove (event) {
        event.preventDefault();
        onMouseMove(event.clientX, event.clientY);
    }

    function onMouseUp (x, y) {
        if (scope.enabled === false) return;

        if (typeof Qt === 'object') {
            // eventSource.mouseMove.disconnect(onMouseMove)
            scope.eventSource.mouseUp.disconnect(onMouseUp);
        } else {
            // document.removeEventListener( 'mousemove', onMouseMove_, false );
            document.removeEventListener('mouseup', onWebMouseUp, false);
        }
        scope.dispatchEvent(endEvent);
        scope._state = OrbitControls.STATE.NONE;
    }

    function onWebMouseUp (event) {
        event.preventDefault();
        onMouseUp(event.clientX, event.clientY);
    }

    function onMouseWheel (x, y, wheelX, wheelY) {
        // if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

        var delta = wheelY;

        scope.constraint.dollyOut(getZoomScale(delta));

        scope.update();
        scope.dispatchEvent(startEvent);
        scope.dispatchEvent(endEvent);

        // off-center zooming :D
        if (scope.camera.position.y >= scope.maxDistance) return;
        var direction = -delta * 0.001001001;
        pan(direction * (x - scope.canvas.width / 2), direction * (y - scope.canvas.height / 2));
    }

    function onWebMouseWheel (event) {
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

    function onKeyDown (event) {
        if (scope.keyDown || scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

        scope.keyDown = // TODO: timer.
        setInterval(function () {
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

    function onKeyUp (event) {
        // TIMER: timer.
        if (typeof Qt === 'object') {
            timer.clearInterval(scope.keyDown);
        } else {
            clearInterval(scope.keyDown);
        }

        scope.keyDown = false;
    }

    function touchstart (event) {
        if (scope.enabled === false) return;

        switch (event.touches.length) {
        case 1: // one-fingered touch: rotate

            if (scope.enableRotate === false) return;

            scope._state = OrbitControls.STATE.TOUCH_ROTATE;

            rotateStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            break;

        case 2: // two-fingered touch: dolly

            if (scope.enableZoom === false) return;

            scope._state = OrbitControls.STATE.TOUCH_DOLLY;

            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance);
            break;

        case 3: // three-fingered touch: pan

            if (scope.enablePan === false) return;

            scope._state = OrbitControls.STATE.TOUCH_PAN;

            panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            break;

        default:

            scope._state = OrbitControls.STATE.NONE;
        }

        if (scope._state !== OrbitControls.STATE.NONE) scope.dispatchEvent(startEvent);
    }

    function touchmove (event) {
        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        switch (event.touches.length) {
        case 1: // one-fingered touch: rotate

            if (scope.enableRotate === false) return;
            if (scope._state !== OrbitControls.STATE.TOUCH_ROTATE) return;

            rotateEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            // rotating across whole screen goes 360 degrees around
            scope.constraint.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.constraint.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);

            scope.update();
            break;

        case 2: // two-fingered touch: dolly

            if (scope.enableZoom === false) return;
            if (scope._state !== OrbitControls.STATE.TOUCH_DOLLY) return;

            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);

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

            if (scope.enablePan === false) return;
            if (scope._state !== OrbitControls.STATE.TOUCH_PAN) return;

            panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);

            scope.update();
            break;

        default:

            scope._state = OrbitControls.STATE.NONE;
        }
    }

    function touchend () {
        if (scope.enabled === false) return;

        scope.dispatchEvent(endEvent);
        scope._state = OrbitControls.STATE.NONE;
    }

    this.dispose = function () {
        if (typeof Qt === 'object') {
            scope.eventSource.mouseDown.disconnect(onMouseDown);
            scope.eventSource.mouseMove.disconnect(onMouseMove);
            scope.eventSource.mouseWheel.disconnect(onMouseWheel);

            scope.eventSource.keyDown.disconnect(onKeyDown);
        } else {
            this._map._renderer.removeEventListener('contextmenu', contextmenu, false);
            this._map._renderer.removeEventListener('mousedown', onWebMouseDown, false);
            this._map._renderer.removeEventListener('mousemove', onWebMouseMove, false);
            this._map._renderer.removeEventListener('mousewheel', onWebMouseWheel, false);

            this._map._renderer.domElement.removeEventListener('touchstart', touchstart, false);
            this._map._renderer.domElement.removeEventListener('touchend', touchend, false);
            this._map._renderer.domElement.removeEventListener('touchmove', touchmove, false);
        }
    };

    // this.domElement.addEventListener( 'contextmenu', contextmenu, false );

    if (typeof Qt === 'object') {
        this.eventSource.mouseDown.connect(onMouseDown);
        this.eventSource.mouseMove.connect(onMouseMove);
        this.eventSource.mouseWheel.connect(onMouseWheel);

        this.eventSource.keyDown.connect(onKeyDown);
        this.eventSource.keyUp.connect(onKeyUp);
    } else {
        this._map._renderer.domElement.addEventListener('mousedown', onWebMouseDown, false);
        this._map._renderer.domElement.addEventListener('mousemove', onWebMouseMove, false);
        this._map._renderer.domElement.addEventListener('mousewheel', onWebMouseWheel, false);

        this._map._renderer.domElement.addEventListener('touchstart', touchstart, false);
        this._map._renderer.domElement.addEventListener('touchend', touchend, false);
        this._map._renderer.domElement.addEventListener('touchmove', touchmove, false);
    }

    // force an update at start
    // this.update();
};

// State
OrbitControls.STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5, CLICKORPAN: 6, CHANGE_PIN_HEIGHT: 7, CHANGE_PIN_POSITION: 8 };

// Events
var changeEvent = { type: 'change' };
var startEvent = { type: 'start' };
var endEvent = { type: 'end' };

function getAutoRotationAngle (primitive) {
    return 2 * Math.PI / 60 / 60 * primitive.autoRotateSpeed;
}

function getZoomScale (delta) {
    return Math.pow(0.999, delta);
}

var screenPosition = new THREE.Vector2();
var picker = new THREE.Raycaster();

function pickerFromScreen (primitive, x, y, picker) {
    screenPosition.set((x / primitive.canvas.width) * 2 - 1, -(y / primitive.canvas.height) * 2 + 1);
    picker.setFromCamera(screenPosition, primitive.object);

    return picker;
}

OrbitControls.prototype.update = function () {
    if (this.autoRotate && this._state === OrbitControls.STATE.NONE) {
        this.constraint.rotateLeft(getAutoRotationAngle(this));
    }

    if (this.constraint.update() === true) {
        this.dispatchEvent(changeEvent);
    }
};

OrbitControls.prototype.reset = function () {
    this._state = OrbitControls.STATE.NONE;

    this.camera.target.copy(this.target0);
    this.camera.position.copy(this.position0);
    this.camera.zoom = this.zoom0;

    this.camera.updateProjectionMatrix();
    this.dispatchEvent(changeEvent);

    this.update();
};

function contextmenu (event) {
    event.preventDefault();
};

OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
OrbitControls.prototype.constructor = THREE.OrbitControls;

OrbitControls.prototype.getPolarAngle = function () {
    return this.constraint.getPolarAngle();
};

OrbitControls.prototype.getAzimuthalAngle = function () {
    return this.constraint.getAzimuthalAngle();
};

Object.defineProperties(OrbitControls.prototype, {
    camera: {
        get: function () {
            return this.constraint.camera;
        }
    },

    target: {
        get: function () {
            return this.constraint.camera.target;
        },
    },

    minDistance: {
        get: function () {
            return this.constraint.minDistance;
        },
        set: function (value) {
            this.constraint.minDistance = value;
        }
    },

    maxDistance: {
        get: function () {
            return this.constraint.maxDistance;
        },
        set: function (value) {
            this.constraint.maxDistance = value;
        }
    },

    minZoom: {
        get: function () {
            return this.constraint.minZoom;
        },
        set: function (value) {
            this.constraint.minZoom = value;
        }
    },

    maxZoom: {
        get: function () {
            return this.constraint.maxZoom;
        },
        set: function (value) {
            this.constraint.maxZoom = value;
        }
    },

    minPolarAngle: {
        get: function () {
            return this.constraint.minPolarAngle;
        },
        set: function (value) {
            this.constraint.minPolarAngle = value;
        }
    },

    maxPolarAngle: {
        get: function () {
            return this.constraint.maxPolarAngle;
        },
        set: function (value) {
            this.constraint.maxPolarAngle = value;
        }
    },

    minAzimuthAngle: {
        get: function () {
            return this.constraint.minAzimuthAngle;
        },
        set: function (value) {
            this.constraint.minAzimuthAngle = value;
        }
    },

    maxAzimuthAngle: {
        get: function () {
            return this.constraint.maxAzimuthAngle;
        },
        set: function (value) {
            this.constraint.maxAzimuthAngle = value;
        }
    },

    enableDamping: {
        get: function () {
            return this.constraint.enableDamping;
        },
        set: function (value) {
            this.constraint.enableDamping = value;
        }
    },

    dampingFactor: {
        get: function () {
            return this.constraint.dampingFactor;
        },
        set: function (value) {
            this.constraint.dampingFactor = value;
        }
    },
});

module.exports = THREE.OrbitControls;

module.exports = OrbitControls;
