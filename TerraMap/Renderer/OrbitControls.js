/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author nutstick / http://github.com/nutstick
 */
/* global THREE, console */

/**
 * OrbitConstraint class
 * @alias OrbitConstraint
 * @constructor
 *
 * @param {Map} map
 * @param {Camera} object
 */
function OrbitConstraint (map, object) {
    this.map = map;

    /**
     * @type Camera
     */
    this.object = object;

    // "target" sets the location of focus, where the object orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = 12000 * Math.pow(2, 8);

    // Limits to how far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = 0.2 * Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = true;
    this.dampingFactor = 0.75;

    this.maxClickTimeInterval = 500;

    // track moving
    this.lastMove = Date.now();
    this.needUpdate = false;

    /// /////////
    // internals

    var scope = this;

    var EPS = 0.000001;

    // Current position in spherical coordinate system.
    var theta;
    var phi;

    // Pending changes
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    // API

    this.getPolarAngle = function () {
        return phi;
    };

    this.getAzimuthalAngle = function () {
        return theta;
    };

    this.rotateLeft = function (angle) {
        thetaDelta -= angle;
        // TODO:
        // compass.update();
    };

    this.rotateUp = function (angle) {
        phiDelta -= angle;
        // TODO:
        // compass.update();
    };

    // pass in distance in world space to move left
    this.panLeft = (function () {
        var v = new THREE.Vector3();

        return function panLeft (distance) {
            var te = this.object.matrix.elements;

            // get X column of matrix
            v.set(te[ 0 ], te[ 1 ], te[ 2 ]);
            v.multiplyScalar(-distance);

            panOffset.add(v);
        };
    }());

    // pass in distance in world space to move up
    this.panUp = (function () {
        var v = new THREE.Vector3();

        return function panUp (distance) {
            var te = this.object.matrix.elements;

            // get Y column of matrix
            v.set(te[ 4 ], /* te[ 5 ] */ 0, te[ 6 ]);
            v.multiplyScalar(distance);

            panOffset.add(v);
        };
    }());

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function (deltaX, deltaY, screenWidth, screenHeight) {
        if (scope.object instanceof THREE.PerspectiveCamera) {
            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub(scope.target);
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft(2 * deltaX * targetDistance / screenHeight);
            scope.panUp(2 * deltaY * targetDistance / screenHeight);
        } else if (scope.object instanceof THREE.OrthographicCamera) {
            // orthographic
            scope.panLeft(deltaX * (scope.object.right - scope.object.left) / screenWidth);
            scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / screenHeight);
        } else {
            // camera neither orthographic or perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
        }
    };

    this.dollyIn = function (dollyScale) {
        if (scope.object instanceof THREE.PerspectiveCamera) {
            scale /= dollyScale;
        } else if (scope.object instanceof THREE.OrthographicCamera) {
            scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        }
    };

    this.dollyOut = function (dollyScale) {
        if (scope.object instanceof THREE.PerspectiveCamera) {
            scale *= dollyScale;
        } else if (scope.object instanceof THREE.OrthographicCamera) {
            scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        }
    };

    this.update = (function () {
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function () {
            var position = this.object.position;

            offset.copy(position).sub(this.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis

            theta = Math.atan2(offset.x, offset.z);

            // angle from y-axis

            phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

            theta += thetaDelta;
            phi += phiDelta;

            // restrict theta to be between desired limits
            theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));

            // restrict phi to be between desired limits
            phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

            var radius = offset.length() * scale;

            // restrict radius to be between desired limits
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

            // move target to panned location
            this.target.add(panOffset);

            offset.x = radius * Math.sin(phi) * Math.sin(theta);
            offset.y = radius * Math.cos(phi);
            offset.z = radius * Math.sin(phi) * Math.cos(theta);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(this.target).add(offset);
            this.object.updatePosition();

            this.object.lookAt(this.target);

            // Update camera matrix
            this.object.updateMatrix();
            this.object.updateMatrixWorld();
            this.object.matrixWorldInverse.getInverse(this.object.matrixWorld);

            if (this.enableDamping === true) {
                thetaDelta *= (1 - this.dampingFactor);
                phiDelta *= (1 - this.dampingFactor);
            } else {
                thetaDelta = 0;
                phiDelta = 0;
            }

            scale = 1;
            panOffset.set(0, 0, 0);

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (lastPosition.distanceToSquared(this.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ||
                zoomChanged) {
                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
                zoomChanged = false;

                if (scope.map.quadTree) {
                    scope.map.quadTree.needUpdate = true;
                }
                // scope.lastMove = Date.now();

                // if (!scope.needsUpdate) {
                //     scope.needsUpdate = timer.setInterval(function(time){
                //         // if (Date.now()-scope.lastMove < 150) return
                //         // else {
                //             scope.map.update();
                //             timer.clearInterval(scope.needsUpdate)
                //             scope.needsUpdate = false
                //         // }
                //     });
                // }

                return true;
            }

            return false;
        };
    }());
};

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - right mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - left mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function (options) {
    if (!options) throw new Error('No option provided');
    if (!options.map) throw new Error('No options.map provided');
    if (!options.map.camera) throw new Error('No options.map.camera provided');
    if (!options.eventSource) throw new Error('No options.eventSource provided');
    if (!options.canvas) throw new Error('No options.canvas provided');

    /**
     * @type Map
     */
    var map = options.map;
    var constraint = new OrbitConstraint(map, map.camera);

    this.eventSource = options.eventSource;
    this.canvas = options.canvas;

    // API

    Object.defineProperty(this, 'constraint', {
        get: function () {
            return constraint;
        }
    });

    this.getPolarAngle = function () {
        return constraint.getPolarAngle();
    };

    this.getAzimuthalAngle = function () {
        return constraint.getAzimuthalAngle();
    };

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
    this.mouseButtons = typeof Qt === 'object'
        ? { ORBIT: Qt.RightButton, ZOOM: Qt.MiddleButton, PAN: Qt.LeftButton }
        : { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    /// /////////
    // internals

    var scope = this;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var lastClick;

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5, CLICKORPAN: 6, CHANGE_PIN_HEIGHT: 7, CHANGE_PIN_POSITION: 8 };

    var state = STATE.NONE;

    var currentPin = null;

    // set start position
    // TODO: using property instead of location
    // setView(this, location.hash)

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    var pan = function (deltaX, deltaY) {
        constraint.pan(deltaX, deltaY, scope.canvas.width, scope.canvas.height);
    };
    // pan(100,100000)
    this.update = function () {
        if (this.autoRotate && state === STATE.NONE) {
            constraint.rotateLeft(getAutoRotationAngle());
        }

        if (constraint.update() === true) {
            this.dispatchEvent(changeEvent);
        }
    };

    this.reset = function () {
        state = STATE.NONE;

        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent(changeEvent);

        this.update();
    };

    this.straighten = function () {
        var currentPos = this.target;
        map.camera.position.x = currentPos.x;
        map.camera.position.z = currentPos.z;
    };

    this.moveTo = function (coords, currentHeight) {
        this.target.copy(coords);
        this.object.position.copy({x: coords.x, y: currentHeight, z: coords.z});
        // TIMER: timer.
        setTimeout(function () { map.quadTree.needUpdate = true; }, 10);
    };

    function getAutoRotationAngle () {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function getZoomScale (delta) {
        return Math.pow(0.999, delta);
    }

    function screenNormalize (x, y) {
        return new THREE.Vector2(
            (x / scope.canvas.width) * 2 - 1,
            -(y / scope.canvas.height) * 2 + 1
        );
    }

    var picker = new THREE.Raycaster();
    function pickerFromScreen (x, y, picker) {
        picker.setFromCamera(screenNormalize(x, y), scope.object);

        return picker;
    }

    function compare (modifiers) {
        if (typeof Qt === 'object') {
            return modifiers & Qt.ControlModifier;
        }

        return modifiers;
    }

    function onMouseDown (x, y, button, modifiers) {
        if (scope.enabled === false) return;

        if (button === scope.mouseButtons.ORBIT || compare(modifiers)) {
            if (scope.enableRotate === false) return;

            state = STATE.ROTATE;

            rotateStart.set(x, y);
        } else if (button === scope.mouseButtons.ZOOM) {
            if (scope.enableZoom === false) return;

            state = STATE.DOLLY;

            dollyStart.set(x, y);
        } else if (button === scope.mouseButtons.PAN) {
            // Checking mouse down on marker
            // TODO: Use mission method to handle object
            var selectedObject = map.mouseDownOnMarkers(pickerFromScreen(x, y, picker));

            panStart.set(x, y);

            var now = Date.now();
            if (selectedObject && selectedObject.name === 'Head') {
                currentPin = selectedObject.pin;

                state = STATE.CHANGE_PIN_HEIGHT;
            } else if (selectedObject && selectedObject.name === 'Arrow') {
                currentPin = selectedObject.pin;

                state = STATE.CHANGE_PIN_POSITION;
            } else if (lastClick && now - lastClick < constraint.maxClickTimeInterval && scope.enableMoveMarker === true) {
                currentPin = map.addPin(pickerFromScreen(x, y, picker));

                state = STATE.CHANGE_PIN_HEIGHT;
            } else if (scope.enablePan === true) {
                state = STATE.PAN;
            }

            lastClick = now;
        }

        if (state !== STATE.NONE) {
            if (typeof Qt === 'object') {
                // eventSource.mouseMove.connect(onMouseMove)
                this.eventSource.mouseUp.connect(onMouseUp);
            } else {
                // document.addEventListener( 'mousemove', onMouseMove_, false );
                document.addEventListener('mouseup', onMouseUp_, false);
            }
            scope.dispatchEvent(startEvent);
        }
    }

    function onMouseDown_ (event) {
        event.preventDefault();

        onMouseDown(event.clientX, event.clientY, event.button, event.ctrlKey);
    }

    function onMouseMove (x, y) {
        if (scope.enabled === false) return;

        if (state === STATE.NONE) {
            // FIXME: Debug
            pickerFromScreen(x, y, picker);
            console.log(picker.intersectObjects(map.quadTree.tiles.children).map(function (k) { return k.object.tile.stringify; }));
        } else if (state === STATE.ROTATE) {
            if (scope.enableRotate === false) return;

            rotateEnd.set(x, y);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            // rotating across whole screen goes 360 degrees around
            constraint.rotateLeft(2 * Math.PI * rotateDelta.x / scope.canvas.width * scope.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            constraint.rotateUp(2 * Math.PI * rotateDelta.y / scope.canvas.height * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
            if (scope.enableZoom === false) return;

            dollyEnd.set(x, y);
            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {
                constraint.dollyIn(getZoomScale());
            } else if (dollyDelta.y < 0) {
                constraint.dollyOut(getZoomScale());
            }

            dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
            if (scope.enablePan === false) return;
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);
        } else if (state === STATE.CHANGE_PIN_HEIGHT) {
            if (scope.enableMoveMarker === false) return;
            panEnd.set(x, y);
            panDelta.subVectors(panEnd, panStart);

            currentPin.offsetHeight(-panDelta.y * scope.object.position.y / scope.canvas.height);

            panStart.copy(panEnd);
        } else if (state === STATE.CHANGE_PIN_POSITION) {
            if (scope.enableMoveMarker === false) return;

            var markerPosition = pickerFromScreen(x, y, picker).intersectObject(map.basePlane)[0].point;
            currentPin.setPosition(markerPosition);
        }

        if (state !== STATE.NONE) scope.update();
    }

    function onMouseMove_ (event) {
        event.preventDefault();
        onMouseMove(event.clientX, event.clientY);
    }

    function onMouseUp (x, y) {
        if (scope.enabled === false) return;

        if (typeof Qt === 'object') {
            // eventSource.mouseMove.disconnect(onMouseMove)
            this.eventSource.mouseUp.disconnect(onMouseUp);
        } else {
            // document.removeEventListener( 'mousemove', onMouseMove_, false );
            document.removeEventListener('mouseup', onMouseUp_, false);
        }
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
    }

    function onMouseUp_ (event) {
        event.preventDefault();
        onMouseUp(event.clientX, event.clientY);
    }

    function onMouseWheel (x, y, wheelX, wheelY) {
        // if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

        var delta = wheelY;

        constraint.dollyOut(getZoomScale(delta));

        scope.update();
        scope.dispatchEvent(startEvent);
        scope.dispatchEvent(endEvent);

        // off-center zooming :D
        if (scope.object.position.y >= scope.maxDistance) return;
        var direction = -delta * 0.001001001;
        pan(direction * (x - scope.canvas.width / 2), direction * (y - scope.canvas.height / 2));
    }

    function onMouseWheel_ (event) {
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
                // scope.update();
                break;

            case scope.keys.LEFT:
                pan(scope.keyPanSpeed, 0);
                // scope.update();
                break;

            case scope.keys.RIGHT:
                pan(-scope.keyPanSpeed, 0);
                // scope.update();
                break;
            }
        }, 10);
    }

    function onKeyUp (event) {
        // TIMER: timer.
        clearInterval(scope.keyDown);
        scope.keyDown = false;
    }

    function touchstart (event) {
        if (scope.enabled === false) return;

        switch (event.touches.length) {
        case 1: // one-fingered touch: rotate

            if (scope.enableRotate === false) return;

            state = STATE.TOUCH_ROTATE;

            rotateStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            break;

        case 2: // two-fingered touch: dolly

            if (scope.enableZoom === false) return;

            state = STATE.TOUCH_DOLLY;

            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance);
            break;

        case 3: // three-fingered touch: pan

            if (scope.enablePan === false) return;

            state = STATE.TOUCH_PAN;

            panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            break;

        default:

            state = STATE.NONE;
        }

        if (state !== STATE.NONE) scope.dispatchEvent(startEvent);
    }

    function touchmove (event) {
        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        switch (event.touches.length) {
        case 1: // one-fingered touch: rotate

            if (scope.enableRotate === false) return;
            if (state !== STATE.TOUCH_ROTATE) return;

            rotateEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            // rotating across whole screen goes 360 degrees around
            constraint.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
            // rotating up and down along whole screen attempts to go 360, but limited to 180
            constraint.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);

            scope.update();
            break;

        case 2: // two-fingered touch: dolly

            if (scope.enableZoom === false) return;
            if (state !== STATE.TOUCH_DOLLY) return;

            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyEnd.set(0, distance);
            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {
                constraint.dollyOut(getZoomScale());
            } else if (dollyDelta.y < 0) {
                constraint.dollyIn(getZoomScale());
            }

            dollyStart.copy(dollyEnd);

            scope.update();
            break;

        case 3: // three-fingered touch: pan

            if (scope.enablePan === false) return;
            if (state !== STATE.TOUCH_PAN) return;

            panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);

            scope.update();
            break;

        default:

            state = STATE.NONE;
        }
    }

    function touchend () {
        if (scope.enabled === false) return;

        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
    }

    this.dispose = function () {
        if (typeof Qt === 'object') {
            // this.eventSource.disconnect( 'contextmenu', contextmenu, false );
            this.eventSource.mouseDown.disconnect(onMouseDown);
            this.eventSource.mouseMove.disconnect(onMouseMove);
            this.eventSource.mouseWheel.disconnect(onMouseWheel);

            // this.eventSource.removeEventListener( 'touchstart', touchstart, false );
            // this.eventSource.removeEventListener( 'touchend', touchend, false );
            // this.eventSource.removeEventListener( 'touchmove', touchmove, false );

            this.eventSource.keyDown.disconnect(onKeyDown);
        } else {
            document.removeEventListener('mousedown', onMouseDown_, false);
            document.removeEventListener('mousemove', onMouseMove_, false);
            document.removeEventListener('mousewheel', onMouseWheel_, false);
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
        document.addEventListener('mousedown', onMouseDown_, false);
        document.addEventListener('mousemove', onMouseMove_, false);
        document.addEventListener('mousewheel', onMouseWheel_, false);

        map._renderer.domElement.addEventListener('touchstart', touchstart, false);
        map._renderer.domElement.addEventListener('touchend', touchend, false);
        map._renderer.domElement.addEventListener('touchmove', touchmove, false);
    }

    // force an update at start
    this.update();
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties(THREE.OrbitControls.prototype, {

    object: {

        get: function () {
            return this.constraint.object;
        }

    },

    target: {

        get: function () {
            return this.constraint.target;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: target is now immutable. Use target.set() instead.');
            this.constraint.target.copy(value);
        }

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

    // backward compatibility

    noZoom: {

        get: function () {
            console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
            return !this.enableZoom;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
            this.enableZoom = !value;
        }

    },

    noRotate: {

        get: function () {
            console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
            return !this.enableRotate;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
            this.enableRotate = !value;
        }

    },

    noPan: {

        get: function () {
            console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
            return !this.enablePan;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
            this.enablePan = !value;
        }

    },

    noKeys: {

        get: function () {
            console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
            return !this.enableKeys;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
            this.enableKeys = !value;
        }

    },

    staticMoving: {

        get: function () {
            console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            return !this.constraint.enableDamping;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            this.constraint.enableDamping = !value;
        }

    },

    dynamicDampingFactor: {

        get: function () {
            console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            return this.constraint.dampingFactor;
        },

        set: function (value) {
            console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            this.constraint.dampingFactor = value;
        }

    }

});

module.exports = THREE.OrbitControls;
