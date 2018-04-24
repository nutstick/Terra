var terra = (function (exports,THREE) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var MapSettings = {
        basePlaneDimension: 20037508.342789244 * 2,
        cameraDistance: 1200000,
        maxCameraDistance: 1200000 * 100,
        debug: true,
        optimize: true,
    };
    //# sourceMappingURL=MapSettings.js.map

    var matrix = new THREE.Matrix4();
    var Cartesian = /** @class */ (function () {
        function Cartesian(options) {
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this.addVectors = THREE.Vector3.prototype.addVectors;
            this.normalize = THREE.Vector3.prototype.normalize;
            this.length = THREE.Vector3.prototype.length;
            this.multiplyScalar = THREE.Vector3.prototype.multiplyScalar;
            this.divideScalar = THREE.Vector3.prototype.divideScalar;
            options = options || {};
            this._x = options.x || 0;
            this._y = options.y || 0;
            this._z = options.height || options.z || 0;
        }
        Cartesian.prototype.set = function (x, y, z) {
            this._x = x;
            this._y = y;
            this._z = z;
            return this;
        };
        Cartesian.prototype.dot = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = THREE.Vector3.prototype.dot).call.apply(_a, [this].concat(args));
            var _a;
        };
        Cartesian.prototype.add = function (o) {
            this._x += o.x;
            this._y += o.y;
            this._z += o.z;
            return this;
        };
        Cartesian.prototype.sub = function (o) {
            this._x -= o.x;
            this._y -= o.y;
            this._z -= o.z;
            return this;
        };
        Cartesian.prototype.crossVectors = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = THREE.Vector3.prototype.crossVectors).call.apply(_a, [this].concat(args));
            var _a;
        };
        Cartesian.prototype.subVectors = function (a, b) {
            this._x = a.x - b.x;
            this._y = a.y - b.y;
            this._z = a.z - b.z;
            return this;
        };
        Cartesian.prototype.clone = function () {
            return new Cartesian({
                x: this._x,
                y: this._y,
                z: this._z,
            });
        };
        Cartesian.prototype.copy = function (other) {
            this._x = other.x;
            this._y = other.y;
            this._z = other.z;
        };
        Cartesian.prototype.unproject = function (camera) {
            // console.log(print(camera.matrixWorld.elements));
            // console.log(print(matrix.getInverse(camera.projectionMatrix).elements));
            matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
            return this.applyMatrix4(matrix);
        };
        Cartesian.prototype.applyMatrix4 = function (m) {
            var x = this.x;
            var y = this.y;
            var z = this.z;
            var e = m.elements;
            var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
            this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
            this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
            this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
            return this;
        };
        Object.defineProperty(Cartesian.prototype, "x", {
            get: function () { return this._x; },
            set: function (x) { this._x = x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cartesian.prototype, "y", {
            get: function () { return this._y; },
            set: function (y) { this._y = y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cartesian.prototype, "z", {
            get: function () { return this._z; },
            set: function (z) { this._z = z; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cartesian.prototype, "height", {
            get: function () { return this._y; },
            set: function (height) { this._y = height; },
            enumerable: true,
            configurable: true
        });
        return Cartesian;
    }());
    //# sourceMappingURL=Cartesian.js.map

    function initialize(ellipsoid, x, y, z) {
        x = x || 0.0;
        y = y || 0.0;
        z = z || 0.0;
        ellipsoid._radii = new Cartesian({ x: x, y: y, z: z });
        ellipsoid._radiiSquared = new Cartesian({ x: x * x, y: y * y, z: z * z });
        ellipsoid._radiiToTheFourth = new Cartesian({ x: x * x * x * x, y: y * y * y * y, z: z * z * z * z });
        ellipsoid._oneOverRadii = new Cartesian({ x: x === 0.0 ? 0.0 : 1.0 / x,
            y: y === 0.0 ? 0.0 : 1.0 / y,
            z: z === 0.0 ? 0.0 : 1.0 / z });
        ellipsoid._oneOverRadiiSquared = new Cartesian({ x: x === 0.0 ? 0.0 : 1.0 / (x * x),
            y: y === 0.0 ? 0.0 : 1.0 / (y * y),
            z: z === 0.0 ? 0.0 : 1.0 / (z * z) });
        ellipsoid._minimumRadius = Math.min(x, y, z);
        ellipsoid._maximumRadius = Math.max(x, y, z);
        // ellipsoid._centerToleranceSquared = CesiumMath.EPSILON1;
        if (ellipsoid._radiiSquared.z !== 0) {
            ellipsoid._squaredXOverSquaredZ = ellipsoid._radiiSquared.x / ellipsoid._radiiSquared.z;
        }
    }
    /**
     * A quadratic surface defined in Cartesian coordinates by the equation
     * <code>(x / a)^2 + (y / b)^2 + (z / c)^2 = 1</code>.  Primarily used
     * by Cesium to represent the shape of planetary bodies.
     *
     * Rather than constructing this object directly, one of the provided
     * constants is normally used.
     * @alias Ellipsoid
     * @constructor
     *
     * @param {Number} [x=0] The radius in the x direction.
     * @param {Number} [y=0] The radius in the y direction.
     * @param {Number} [z=0] The radius in the z direction.
     *
     * @exception {DeveloperError} All radii components must be greater than or equal to zero.
     *
     * @see Ellipsoid.fromCartesian3
     * @see Ellipsoid.WGS84
     * @see Ellipsoid.UNIT_SPHERE
     */
    var Ellipsoid = /** @class */ (function () {
        function Ellipsoid(x, y, z) {
            initialize(this, x, y, z);
        }
        Object.defineProperty(Ellipsoid.prototype, "radii", {
            get: function () {
                return this._radii;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "radiiSquared", {
            get: function () {
                return this._radiiSquared;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "radiiToTheFourth", {
            get: function () {
                return this._radiiToTheFourth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "oneOverRadii", {
            get: function () {
                return this._oneOverRadii;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "oneOverRadiiSquared", {
            get: function () {
                return this._oneOverRadiiSquared;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "minimumRadius", {
            get: function () {
                return this._minimumRadius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "maximumRadius", {
            get: function () {
                return this._maximumRadius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ellipsoid.prototype, "a", {
            get: function () {
                return Math.PI * this._maximumRadius;
            },
            enumerable: true,
            configurable: true
        });
        Ellipsoid.WGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);
        Ellipsoid.UNIT_SPHERE = new Ellipsoid(1.0, 1.0, 1.0);
        return Ellipsoid;
    }());
    //# sourceMappingURL=Ellipsoid.js.map

    var EPSLN = 1.0e-10;
    var D2R = Math.PI / 180;
    var R2D = 180 / Math.PI;
    var cache = {};
    var System;
    (function (System) {
        System[System["WGS84"] = 0] = "WGS84";
        System[System["EPSG4326"] = 1] = "EPSG4326";
        System[System["EPSG3857"] = 2] = "EPSG3857";
    })(System || (System = {}));
    var SphericalMercator = /** @class */ (function () {
        function SphericalMercator(options) {
            this.size = options.size || 256;
            if (!cache[this.size]) {
                var size = this.size;
                var c = cache[this.size] = {};
                c.Bc = [];
                c.Cc = [];
                c.zc = [];
                c.Ac = [];
                for (var d = 0; d < 30; ++d) {
                    c.Bc.push(size / 360);
                    c.Cc.push(size / (2 * Math.PI));
                    c.zc.push(size / 2);
                    c.Ac.push(size);
                    size *= 2;
                }
            }
            this.Bc = cache[this.size].Bc;
            this.Cc = cache[this.size].Cc;
            this.zc = cache[this.size].zc;
            this.Ac = cache[this.size].Ac;
            this.meterPerPixel = this.mPerPixel(0);
        }
        SphericalMercator.prototype.mPerPixel = function (latitude) {
            latitude = latitude || 0;
            return Math.abs(Ellipsoid.WGS84.maximumRadius * 2 * Math.PI * Math.cos(latitude * Math.PI / 180) / this.size);
        };
        SphericalMercator.prototype.PixelToCartographic = function (px, cartographic) {
            var g = (px.z + MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
            cartographic.longitude = Math.min((px.x + MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0], 180 - EPSLN);
            cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
            var meterPerPixel = this.mPerPixel(cartographic.latitude);
            cartographic.altitude = px.y * meterPerPixel;
        };
        SphericalMercator.prototype.CartographicToPixel = function (coordinate, px) {
            var d = this.zc[0];
            var f = Math.min(Math.max(Math.sin(D2R * coordinate.latitude), -0.9999), 0.9999);
            var x = (d + coordinate.longitude * this.Bc[0]);
            var y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
            if (x > this.Ac[0]) {
                x = this.Ac[0];
            }
            if (y > this.Ac[0]) {
                y = this.Ac[0];
            }
            // if (x < 0) x = 0;
            // if (y < 0) y = 0;
            px.x = x - MapSettings.basePlaneDimension / 2;
            px.y = coordinate.altitude / this.mPerPixel(0);
            px.z = y - MapSettings.basePlaneDimension / 2;
            return px;
        };
        /**
         * Convert given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
         * @param {QtPositioning.coordinate} coordinate
         * @param {Cartesian} cartesian
         *
         * @return {Cartesian}
         */
        SphericalMercator.prototype.CartographicToCartesian = function (cartographic, cartesian) {
            var d = this.zc[0];
            var f = Math.min(Math.max(Math.sin(D2R * cartographic.latitude), -0.9999), 0.9999);
            var x = (d + cartographic.longitude * this.Bc[0]);
            var y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
            if (x > this.Ac[0]) {
                x = this.Ac[0];
            }
            if (y > this.Ac[0]) {
                y = this.Ac[0];
            }
            // if (x < 0) x = 0;
            // if (y < 0) y = 0;
            cartesian.x = x - MapSettings.basePlaneDimension / 2;
            cartesian.y = cartographic.altitude / this.mPerPixel(0);
            cartesian.z = y - MapSettings.basePlaneDimension / 2;
            return cartesian;
            // TODO:
            // const longitude = cartographic.longitude;
            // const latitude = cartographic.latitude;
            // const mX = longitude * Ellipsoid.WGS84.a;
            // let mY = Math.log(Math.tan((90 + latitude) * D2R / 2)) * R2D;
            // mY = mY * Ellipsoid.WGS84.a / 180.0;
            // cartesian.x = mX;
            // cartesian.y = mY;
            // cartesian.height = cartographic.altitude;
            // return cartesian;
        };
        SphericalMercator.prototype.FCartographicToCartesian = function (cartographic, cartesian) {
            var d = this.zc[0];
            // const f = Math.min(Math.max(Math.sin(D2R * cartographic.latitude), -1), 1);
            var x = (d + cartographic.longitude * this.Bc[0]);
            var y = (d + 2 * cartographic.latitude * (-this.Bc[0]));
            // let y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
            cartesian.x = x - MapSettings.basePlaneDimension / 2;
            cartesian.y = cartographic.altitude / this.mPerPixel(0);
            cartesian.z = y - MapSettings.basePlaneDimension / 2;
            return cartesian;
        };
        SphericalMercator.prototype.CartesianToCartographic = function (cartesian, cartographic) {
            var g = (cartesian.z + MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
            cartographic.longitude = Math.min((cartesian.x + MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0], 180 - EPSLN);
            cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
            var meterPerPixel = this.mPerPixel(cartographic.latitude);
            cartographic.altitude = cartesian.y * meterPerPixel;
        };
        SphericalMercator.prototype.CartographicToEPSG4326 = function (cartographic, cartesian) {
            cartesian.x = cartographic.longitude / 90 * Ellipsoid.WGS84.maximumRadius;
            cartesian.y = cartographic.altitude;
            cartesian.z = cartographic.latitude / 90 * Ellipsoid.WGS84.maximumRadius;
        };
        return SphericalMercator;
    }());
    var sphericalMercator = new SphericalMercator({ size: MapSettings.basePlaneDimension });
    //# sourceMappingURL=SphericalMercator.js.map

    var screenPosition = new THREE.Vector2();
    var MapUtility = /** @class */ (function () {
        function MapUtility() {
        }
        MapUtility.ground = function (position) {
            var _ = position.clone();
            // FIXME: ground = 0 by now
            _.y = 0;
            return _;
        };
        MapUtility.tenMeters = function (latitude) {
            return 10 / (latitude ? sphericalMercator.mPerPixel(latitude) : sphericalMercator.meterPerPixel);
        };
        MapUtility.rayCasterFromScreen = function (primitive, x, y, picker) {
            screenPosition.set((x / primitive.canvas.width) * 2 - 1, -(y / primitive.canvas.height) * 2 + 1);
            picker.setFromCamera(screenPosition, primitive.camera);
            return picker;
        };
        MapUtility.lerp = function (p, q, time) {
            return ((1.0 - time) * p) + (time * q);
        };
        return MapUtility;
    }());
    //# sourceMappingURL=MapUtility.js.map

    var RenderingObject = /** @class */ (function () {
        function RenderingObject() {
        }
        return RenderingObject;
    }());
    //# sourceMappingURL=RenderingObject.js.map

    var Mission = /** @class */ (function (_super) {
        __extends(Mission, _super);
        function Mission(options) {
            var _this = _super.call(this) || this;
            _this._map = options.map;
            return _this;
        }
        return Mission;
    }(RenderingObject));
    //# sourceMappingURL=Mission.js.map

    var Pin = /** @class */ (function (_super) {
        __extends(Pin, _super);
        function Pin(options) {
            var _this = _super.call(this) || this;
            _this._mission = options.mission;
            _this._index = options.index;
            var headGeometry = new THREE.CylinderGeometry(3, 3, 8, 8, 1);
            // Recalculate centroid of mesh offset by 8
            for (var i = 0, len = headGeometry.vertices.length; i < len; i++) {
                headGeometry.vertices[i].y += 8;
            }
            _this.head = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true }));
            _this.head.name = 'Head';
            _this.head.pin = _this;
            var arrowGeometry = new THREE.CylinderGeometry(4, 0, 6, 6, 1);
            // Recalculate centroid
            for (var i_ = 0, len_ = arrowGeometry.vertices.length; i_ < len_; i_++) {
                arrowGeometry.vertices[i_].y += 3;
            }
            arrowGeometry.computeBoundingSphere();
            _this.arrow = new THREE.Mesh(arrowGeometry, new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true }));
            _this.arrow.name = 'Arrow';
            _this.arrow.pin = _this;
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(_this.arrow.position);
            lineGeometry.vertices.push(_this.head.position);
            _this.line = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 }));
            _this.line.name = 'Line';
            /**
             * Pack of all mesh in pin (head, line, arrow)
             * @type {THREE.Group}
             */
            _this.group = new THREE.Group();
            _this.group.add(_this.head);
            _this.group.add(_this.line);
            _this.group.add(_this.arrow);
            _this.group.name = 'Pin';
            // TODO: Map should have addRenderingObject function instead of direct access to scene
            _this._mission._map.scene.add(_this.group);
            _this._rGPosition = _this.arrow.position;
            _this._rPosition = _this.head.position;
            // TODO: Can it be Carsetian
            _this._position = new Cartesian();
            _this._coordinate = QtPositioning.coordinate();
            // Initialize pin position
            _this.position = options.position;
            /**
             * Last move scale of pin
             * @type {number}
             */
            // TODO: lastScale inside mission or map so that no need to calculate on all pin
            _this.lastScale = 1.0;
            // Add Target Subscribe to this object
            _this._mission._map.addSubscribeObject(_this);
            return _this;
        }
        /**
         * Free memory and remove pin from rendering
         */
        Pin.prototype.dispose = function () {
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
        };
        Pin.prototype.updateTarget = function (target) {
            // Update rendering position
            this._rPosition.subVectors(this._position, target);
            // TODO: elevation projection instead of 0
            this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
            this.line.geometry.verticesNeedUpdate = true;
        };
        Object.defineProperty(Pin.prototype, "position", {
            get: function () { return this._position; },
            set: function (p) {
                if (!p) {
                    this._position.y = MapUtility.tenMeters();
                }
                else {
                    // Case position is a QtPositioning.coordiante
                    if (p.longitude) {
                        sphericalMercator.CartographicToCartesian(p, this._position);
                    }
                    else {
                        this._position.copy(p);
                        // Default height is 10 meters
                        this._position.y = this._position.y || MapUtility.tenMeters();
                    }
                }
                // Update rendering position
                this.updateTarget(this._mission._map.camera.target);
                this._mission.updatePin(this._index);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pin.prototype, "groundPosition", {
            get: function () { return new THREE.Vector3(this._position.x, 0, this._position.y); },
            set: function (p) {
                // Case position is a QtPositioning.coordiante
                if (p.longitude) {
                    // TODO: Ground
                    sphericalMercator.CartographicToCartesian(p, this._position);
                    this._position.y = 0;
                }
                else {
                    this._position.x = p.x;
                    this._position.z = p.z;
                }
                this.updateTarget(this._mission._map.camera.target);
                this._mission.updatePin(this._index);
            },
            enumerable: true,
            configurable: true
        });
        Pin.prototype.coordinate = function () {
            sphericalMercator.CartesianToCartographic(this._position, this._coordinate);
            return this._coordinate;
        };
        Object.defineProperty(Pin.prototype, "height", {
            get: function () { return this._position.y; },
            set: function (h) {
                this._position.y = h;
                this.updateTarget(this._mission._map.camera.target);
                this._mission.updatePin(this._index);
            },
            enumerable: true,
            configurable: true
        });
        Pin.prototype.getScale = function () { return this.lastScale; };
        Pin.prototype.setScale = function (s) {
            if (this.lastScale === s) {
                return;
            }
            this.head.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
            this.arrow.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
            this.lastScale = s;
        };
        return Pin;
    }(RenderingObject));
    //# sourceMappingURL=Pin.js.map

    var panStart = new THREE.Vector2();
    var picker = new THREE.Raycaster();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var px = new THREE.Vector3();
    var Polygon = /** @class */ (function (_super) {
        __extends(Polygon, _super);
        function Polygon(options) {
            var _this = _super.call(this, options) || this;
            _this.gridGenerateOffset = new THREE.Vector3();
            _this.pins = [];
            _this.grids = [];
            _this.angles = [];
            _this.lines = [];
            _this.gridMesh = undefined;
            _this.gridGenerateOffset = new THREE.Vector3();
            _this._closeLine = undefined;
            _this.debug = {
                updated: false,
            };
            _this._map.addSubscribeObject(_this);
            /**
             * Controller
             */
            _this.enableMoveMarker = true;
            _this.activePin = undefined;
            return _this;
        }
        Polygon.prototype.updateTarget = function (target) {
            this.lines.forEach(function (line) {
                line.geometry.verticesNeedUpdate = true;
            });
            if (this._closeLine) {
                this._closeLine.geometry.verticesNeedUpdate = true;
            }
            if (this.gridMesh) {
                this.gridMesh.position.set(this.gridGenerateOffset.x - target.x, this.gridGenerateOffset.y - target.y, this.gridGenerateOffset.z - target.z);
            }
        };
        Polygon.prototype.addPin = function (position, height) {
            var index = this.pins.length;
            var pin = new Pin({
                index: index,
                mission: this,
                position: position,
            });
            this.pins.push(pin);
            if (this.pins.length > 1) {
                var lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(this.pins[index - 1].head.position);
                lineGeometry.vertices.push(this.pins[index].head.position);
                var line = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }));
                this.lines.push(line);
                this._map.scene.add(line);
                if (!this._closeLine) {
                    var lineGeometry_ = new THREE.Geometry();
                    lineGeometry_.vertices.push(this.pins[index].head.position);
                    lineGeometry_.vertices.push(this.pins[0].head.position);
                    this._closeLine = new THREE.LineSegments(lineGeometry_, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }));
                    this._map.scene.add(this._closeLine);
                }
                else {
                    this._closeLine.geometry.vertices[0] = this.pins[index].head.position;
                    this._closeLine.geometry.verticesNeedUpdate = true;
                }
            }
            if (MapSettings.debug) {
                this.debug = { updated: true };
            }
            return pin;
        };
        Polygon.prototype.updatePin = function (index) {
            if (index > 0 && index - 1 < this.lines.length) {
                this.lines[index - 1].geometry.verticesNeedUpdate = true;
            }
            if (index + 1 < this.pins.length) {
                this.lines[index].geometry.verticesNeedUpdate = true;
            }
            if (this.pins.length > 1) {
                if (index === 0) {
                    this._closeLine.geometry.verticesNeedUpdate = true;
                }
                else if (index + 1 === this.pins.length) {
                    this._closeLine.geometry.verticesNeedUpdate = true;
                }
            }
        };
        Polygon.prototype.clearPins = function () {
            // Clear all pins
            this.pins.forEach(function (pin) {
                pin.dispose();
            });
            this.pins.length = 0;
            for (var i_ = 0; i_ < this.lines.length; i_++) {
                var line = this.lines[i_];
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
        };
        Polygon.prototype.interactableObjects = function () {
            return this.pins.reduce(function (prev, pin) {
                prev.push(pin.head);
                prev.push(pin.arrow);
                return prev;
            }, []);
        };
        Polygon.prototype.onMouseDown = function (controls, x, y, button) {
            var now = Date.now();
            var intersects;
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
                }
                else if (intersects.length > 1) {
                    console.warn('Mouse down on more than one tile.');
                }
                var position = intersects[0].point.add(controls.camera.target);
                this.activePin = this.addPin(position);
                controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
                controls._lastClick = null;
                return true;
            }
            MapUtility.rayCasterFromScreen(controls, x, y, picker);
            intersects = picker.intersectObjects(this.interactableObjects());
            if (intersects.length > 0) {
                var obj = intersects[0].object;
                if (obj.name === 'Head') {
                    this.activePin = obj.pin;
                    controls._state = Polygon.STATE.CHANGE_PIN_HEIGHT;
                }
                else if (obj.name === 'Arrow') {
                    this.activePin = obj.pin;
                    controls._state = Polygon.STATE.CHANGE_PIN_POSITION;
                }
                return true;
            }
            return false;
        };
        Polygon.prototype.onMouseMove = function (controls, x, y) {
            if (controls._state === Polygon.STATE.CHANGE_PIN_HEIGHT) {
                if (!this.enableMoveMarker) {
                    return false;
                }
                panEnd.set(x, y);
                panDelta.subVectors(panEnd, panStart);
                this.activePin.height += -panDelta.y * controls.camera.position.y / controls.canvas.height;
                panStart.copy(panEnd);
                return true;
            }
            else if (controls._state === Polygon.STATE.CHANGE_PIN_POSITION) {
                if (!this.enableMoveMarker) {
                    return false;
                }
                MapUtility.rayCasterFromScreen(controls, x, y, picker);
                // TODO: Deprecated base plane
                var markerPosition = picker.intersectObjects(this._map.quadTree.tiles.children)[0].point;
                this.activePin.groundPosition = markerPosition.add(controls.camera.target);
                return true;
            }
            return false;
        };
        Polygon.prototype.generateGrid = function (type, gridSpace, angle, speed, minute) {
            var _this = this;
            var target = this._map.camera.target;
            this.gridGenerateOffset.set(target.x, target.y, target.z);
            // Call C++ function to genreate flight grid
            if (type === 'opt') {
                if (speed) {
                    optimizeGridCalculation.speed = speed;
                }
                if (minute) {
                    optimizeGridCalculation.minute = minute;
                }
                var res = optimizeGridCalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate(), gridSpace);
                this.grids = res.map(function (x) {
                    return x.grid;
                });
                this.angles = res.map(function (x) {
                    return x.angle;
                });
            }
            else {
                if (speed) {
                    gridcalculation.speed = speed;
                }
                if (minute) {
                    gridcalculation.minute = minute;
                }
                this.grids = gridcalculation.genGridInsideBound(this.pinsCoordinate, this._map.vehicle.coordinate(), gridSpace, angle || 0);
            }
            // Redraw grid mesh
            // Remove exist mesh first
            if (this.gridMesh) {
                this.gridMesh.children.map(function (mesh) {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                });
                this.gridMesh.children.length = 0;
                this._map.scene.remove(this.gridMesh);
            }
            // Define grid mesh as an array of consecutive line
            this.gridMesh = new THREE.Group();
            this._map.scene.add(this.gridMesh);
            // Create each grid from geneated data
            this.grids.forEach(function (grid) {
                var lineGeometry = new THREE.Geometry();
                for (var i = 0; i < grid.length; i++) {
                    // Passing Geocoordinate to 3D Point
                    sphericalMercator.CartographicToPixel(grid[i], px);
                    // Doubling point, so it's will render consecutive line
                    var v = px.clone().sub(_this.gridGenerateOffset);
                    if (i !== 0) {
                        lineGeometry.vertices.push(v);
                    }
                    lineGeometry.vertices.push(v);
                }
                _this.gridMesh.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
                    color: Math.random() * 0xffffff,
                    linewidth: 3,
                    transparent: true,
                    opacity: 0.8,
                })));
            });
            return this.grids;
        };
        Object.defineProperty(Polygon.prototype, "pinsCoordinate", {
            get: function () {
                return this.pins.map(function (pin) {
                    return pin.coordinate();
                });
            },
            enumerable: true,
            configurable: true
        });
        Polygon.prototype.coordinate = function () {
            return QtPositioning.coordinate();
        };
        Polygon.prototype.getScale = function () { return 1; };
        Polygon.prototype.setScale = function (scale) { return; };
        Polygon.STATE = { CHANGE_PIN_HEIGHT: -2, CHANGE_PIN_POSITION: -3 };
        return Polygon;
    }(Mission));
    //# sourceMappingURL=Polygon.js.map

    var panStart$1 = new THREE.Vector2();
    var picker$1 = new THREE.Raycaster();
    var panEnd$1 = new THREE.Vector2();
    var panDelta$1 = new THREE.Vector2();
    var px$1 = new THREE.Vector3();
    var Polyline = /** @class */ (function (_super) {
        __extends(Polyline, _super);
        function Polyline(options) {
            var _this = _super.call(this, options) || this;
            /**
             * Pin point that define polyline direction
             * @type {Pin[]}
             */
            _this.pins = [];
            /**
             * Three.Line
             * @type {THREE.LineSegments}
             */
            _this.lines = [];
            _this.debug = {
                updated: false,
            };
            _this._map.addSubscribeObject(_this);
            /**
             * Controller
             */
            /**
             * Set to false to disable marker modifiered
             * @type {bool}
             */
            _this.enableMoveMarker = true;
            _this.activePin = undefined;
            return _this;
        }
        Polyline.prototype.updateTarget = function (target) {
            this.lines.forEach(function (line) {
                line.geometry.verticesNeedUpdate = true;
            });
        };
        Polyline.prototype.addPin = function (position, height) {
            var index = this.pins.length;
            var pin = new Pin({
                index: index,
                mission: this,
                position: position,
            });
            this.pins.push(pin);
            if (this.pins.length > 1) {
                var lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(this.pins[index - 1].head.position);
                lineGeometry.vertices.push(this.pins[index].head.position);
                var line = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.6 }));
                this.lines.push(line);
                this._map.scene.add(line);
            }
            if (MapSettings.debug) {
                this.debug = { updated: true };
            }
            return pin;
        };
        Polyline.prototype.updatePin = function (index) {
            if (index > 0 && index - 1 < this.lines.length) {
                this.lines[index - 1].geometry.verticesNeedUpdate = true;
            }
            if (index + 1 < this.pins.length) {
                this.lines[index].geometry.verticesNeedUpdate = true;
            }
        };
        Polyline.prototype.clearPins = function () {
            // Clear all pins
            this.pins.forEach(function (pin) { return pin.dispose(); });
            this.pins.length = 0;
            for (var i_ = 0; i_ < this.lines.length; i_++) {
                var line = this.lines[i_];
                this._map.scene.remove(line);
                line.geometry.dispose();
                line.material.dispose();
                this.lines[i_] = undefined;
            }
            this.lines.length = 0;
        };
        Polyline.prototype.interactableObjects = function () {
            return this.pins.reduce(function (prev, pin) {
                prev.push(pin.head);
                prev.push(pin.arrow);
                return prev;
            }, []);
        };
        Polyline.prototype.onMouseDown = function (controls, x, y, button) {
            var now = Date.now();
            var intersects;
            panStart$1.set(x, y);
            // Doubled click => Create new PIN
            if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval &&
                this.enableMoveMarker === true) {
                MapUtility.rayCasterFromScreen(controls, x, y, picker$1);
                intersects = picker$1.intersectObjects(this._map.quadTree.tiles.children);
                if (!intersects.length) {
                    console.warn('Mouse down position have no intersect with any tiles.');
                    controls._lastClick = null;
                    return true;
                }
                else if (intersects.length > 1) {
                    console.warn('Mouse down on more than one tile.');
                }
                var position = intersects[0].point.add(controls.camera.target);
                this.activePin = this.addPin(position);
                controls._state = Polyline.STATE.CHANGE_PIN_HEIGHT;
                controls._lastClick = null;
                return true;
            }
            MapUtility.rayCasterFromScreen(controls, x, y, picker$1);
            intersects = picker$1.intersectObjects(this.interactableObjects());
            if (intersects.length > 0) {
                var obj = intersects[0].object;
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
        };
        Polyline.prototype.onMouseMove = function (controls, x, y) {
            if (controls._state === Polyline.STATE.CHANGE_PIN_HEIGHT) {
                if (!this.enableMoveMarker) {
                    return false;
                }
                panEnd$1.set(x, y);
                panDelta$1.subVectors(panEnd$1, panStart$1);
                this.activePin.height += -panDelta$1.y * controls.camera.position.y / controls.canvas.height;
                panStart$1.copy(panEnd$1);
                return true;
            }
            else if (controls._state === Polyline.STATE.CHANGE_PIN_POSITION) {
                if (!this.enableMoveMarker) {
                    return false;
                }
                MapUtility.rayCasterFromScreen(controls, x, y, picker$1);
                // TODO: Deprecated base plane
                var markerPosition = picker$1.intersectObjects(this._map.quadTree.tiles.children)[0].point;
                this.activePin.groundPosition = markerPosition.add(controls.camera.target);
                return true;
            }
            return false;
        };
        Object.defineProperty(Polyline.prototype, "pinsCoordinate", {
            get: function () {
                return this.pins.map(function (pin) { return pin.coordinate(); });
            },
            enumerable: true,
            configurable: true
        });
        Polyline.prototype.coordinate = function () {
            return QtPositioning.coordinate();
        };
        Polyline.prototype.getScale = function () { return 1; };
        Polyline.prototype.setScale = function (scale) { return; };
        Polyline.STATE = { CHANGE_PIN_HEIGHT: -2, CHANGE_PIN_POSITION: -3 };
        return Polyline;
    }(Mission));
    //# sourceMappingURL=Polyline.js.map

    var Skybox = /** @class */ (function (_super) {
        __extends(Skybox, _super);
        function Skybox() {
            var _this = this;
            var skyboxTexture = new THREE.CubeTexture([]);
            skyboxTexture.format = THREE.RGBFormat;
            // const loader = new THREE.ImageLoader();
            var textures = [
                new THREE.TextureLoader().load('../skybox/skybox_nx.jpg'),
                new THREE.TextureLoader().load('../skybox/skybox_ny.jpg'),
                new THREE.TextureLoader().load('../skybox/skybox_nz.jpg'),
                new THREE.TextureLoader().load('../skybox/skybox_px.jpg'),
                new THREE.TextureLoader().load('../skybox/skybox_py.jpg'),
                new THREE.TextureLoader().load('../skybox/skybox_pz.jpg'),
            ];
            // loader.load('./2.png', (image) => {
            //     const getSide = (x, y) => {
            //         const size = 1024;
            //         const canvas = document.createElement('canvas');
            //         canvas.width = size;
            //         canvas.height = size;
            //         const context = canvas.getContext('2d');
            //         context.drawImage(image, - x * size, - y * size);
            //         return new THREE.Texture(canvas);
            //     };
            //     skyboxTexture.images[ 0 ] = getSide( 2, 1 ); // px
            //     skyboxTexture.images[ 1 ] = getSide( 0, 1 ); // nx
            //     skyboxTexture.images[ 2 ] = getSide( 1, 0 ); // py
            //     skyboxTexture.images[ 3 ] = getSide( 1, 2 ); // ny
            //     skyboxTexture.images[ 4 ] = getSide( 1, 1 ); // pz
            //     skyboxTexture.images[ 5 ] = getSide( 3, 1 ); // nz
            //     skyboxTexture.needsUpdate = true;
            // });
            var materialArray = [];
            for (var i = 0; i < 6; i++) {
                materialArray.push(new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    // map: textures[0],
                    // wireframe: true,
                    side: THREE.DoubleSide,
                }));
            }
            var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
            // const shader = THREE.ShaderLib.cube;
            // const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
            // uniforms.tCube.texture = skyboxTexture;   // textureCube has been init before
            // const material_ = new THREE.ShaderMaterial({
            //     fragmentShader: shader.fragmentShader,
            //     vertexShader: shader.vertexShader,
            //     uniforms,
            // });
            _this = _super.call(this, new THREE.CubeGeometry(MapSettings.basePlaneDimension, MapSettings.basePlaneDimension, MapSettings.basePlaneDimension, 1, 1, 1), skyMaterial) || this;
            _this.position.y = MapSettings.basePlaneDimension / 2 - 100;
            return _this;
        }
        return Skybox;
    }(THREE.Mesh));
    //# sourceMappingURL=Skybox.js.map

    var Vehicle = /** @class */ (function (_super) {
        __extends(Vehicle, _super);
        function Vehicle(options) {
            var _this = _super.call(this) || this;
            _this._map = options.map;
            var headGeometry = new THREE.Geometry();
            var radius = 7.5;
            var x = radius * 2.0 / 3.0;
            var offset = 0; // radius / 3.0;
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
            _this.head = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true }));
            _this.head.name = 'Head';
            /**
             * Line between head and arrow geometry
             * @type {THREE.Geometry}
             */
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3());
            lineGeometry.vertices.push(_this.head.position);
            /**
             * ine between head and arrow
             * @type {THREE.LineSegments}
             */
            _this.line = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3, transparent: true, opacity: 0.8 }));
            _this.line.name = 'Line';
            /**
             * Pack of all mesh in pin (head, line, arrow)
             * @type {THREE.Group}
             */
            _this.group = new THREE.Group();
            _this.group.add(_this.head);
            _this.group.add(_this.line);
            _this.group.name = 'Vehicle';
            options.map.scene.add(_this.group);
            // var box = new THREE.BoxHelper(this.group, 0xffff00);
            // options.map.scene.add(box);
            /**
             * Rendered Point at Ground
             * @type {THREE.Vector3}
             * @private
             */
            _this._rGPosition = _this.line.geometry.vertices[0];
            /**
             * Rendered Point
             * @type {THREE.Vector3}
             * @private
             */
            _this._rPosition = _this.head.position;
            // TODO: Can it be Carsetian
            /**
             * Position
             * @type {THREE.Vector3}
             * @private
             */
            _this._position = new THREE.Vector3();
            _this._coordinate = QtPositioning.coordinate();
            /**
             * Head angle from North (0, -1, 0)
             * @type {number}
             * @private
             */
            _this._headAngle = 0.0;
            // Initialize pin position
            if (options.position) {
                _this.position = options.position;
            }
            /**
             * Scale
             * @type {number}
             */
            _this.lastScale = 1.0;
            // Add Target Subscribe to this object
            options.map.addSubscribeObject(_this);
            return _this;
        }
        /**
         * Free memory and remove vehicle from rendering
         */
        Vehicle.prototype.dispose = function () {
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
        };
        Vehicle.prototype.updateTarget = function (target) {
            // Update rendering position
            this._rPosition.subVectors(this._position, target);
            // TODO: elevation projection instead of 0
            this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
            this.line.geometry.verticesNeedUpdate = true;
        };
        Object.defineProperty(Vehicle.prototype, "position", {
            get: function () { return this._position; },
            set: function (p) {
                if (!p) {
                    this._position.y = MapUtility.tenMeters();
                }
                else {
                    // Case position is a QtPositioning.coordiante
                    if (p.longitude) {
                        sphericalMercator.CartographicToPixel(p, this._position);
                    }
                    else {
                        this._position.copy(p);
                        // Default height is 10 meters
                        this._position.y = this._position.y || MapUtility.tenMeters();
                    }
                }
                // Restrict position above ground only
                this._position.y = Math.max(this._position.y, 0);
                // Update rendering position
                // TODO: Is this._map needs
                this._rPosition.subVectors(this._position, this._map.camera.target);
                // TODO: elevation projection instead of 0
                this._rGPosition.set(this._rPosition.x, 0, this._rPosition.z);
                this.line.geometry.verticesNeedUpdate = true;
                this._map.cameraController.update();
            },
            enumerable: true,
            configurable: true
        });
        Vehicle.prototype.coordinate = function () {
            sphericalMercator.PixelToCartographic(this._position, this._coordinate);
            return this._coordinate;
        };
        Object.defineProperty(Vehicle.prototype, "height", {
            get: function () { return this._position.y; },
            set: function (h) {
                this._position.y = h;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vehicle.prototype, "headAngle", {
            get: function () {
                return -this._headAngle * 180 / Math.PI;
            },
            set: function (angle) {
                var angle_ = -angle * Math.PI / 180;
                this.head.geometry.rotateY(angle_ - this._headAngle);
                this._headAngle = angle_;
            },
            enumerable: true,
            configurable: true
        });
        Vehicle.prototype.getScale = function () { return this.lastScale; };
        Vehicle.prototype.setScale = function (s) {
            if (this.lastScale === s) {
                return;
            }
            this.head.geometry.scale(s / this.lastScale, s / this.lastScale, s / this.lastScale);
            this.lastScale = s;
        };
        return Vehicle;
    }(RenderingObject));
    //# sourceMappingURL=Vehicle.js.map

    var t = new Cartesian();
    var s = new THREE.Vector3();
    var corner = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
    var Camera = /** @class */ (function (_super) {
        __extends(Camera, _super);
        // FIXME: Debug
        // geometry: THREE.Geometry;
        function Camera(options) {
            var _this = _super.call(this, 70, options.canvas.width / options.canvas.height, 1 / 99, 12000000 / Math.sin(70 * Math.PI)) || this;
            _this.target = new Cartesian();
            _this._targetCartographic = QtPositioning.coordinate();
            _this._positionCartographic = QtPositioning.coordinate();
            _this._map = options.map;
            _this._targetCartographic = QtPositioning.coordinate();
            _this._positionCartographic = QtPositioning.coordinate();
            _this._culledGroundPlane = [new Cartesian(), new Cartesian(), new Cartesian(), new Cartesian()];
            _this.updatedLastFrame = false;
            return _this;
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
        Camera.prototype.setPosition = function (position) {
            if (!position) {
                throw new Error('No position provided');
            }
            // Partial set x, y, z of position
            this.position.x = position.x || this.position.x;
            this.position.y = position.y || this.position.y;
            this.position.z = position.z || this.position.z;
            sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);
            this.updatedLastFrame = true;
        };
        Camera.prototype.update = function () {
            // Update Cartographic position
            sphericalMercator.CartesianToCartographic(this.target, this._targetCartographic);
            t.addVectors(this.target, this.position);
            sphericalMercator.CartesianToCartographic(t, this._positionCartographic);
            this.updatedLastFrame = true;
            // Calculate ray direction at 4 corners of screen
            var scale;
            for (var i = 0; i < 4; i++) {
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
        };
        Object.defineProperty(Camera.prototype, "positionCartographic", {
            get: function () {
                return this._positionCartographic;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "targetCartographic", {
            get: function () {
                return this._targetCartographic;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "culledGroundPlane", {
            get: function () {
                return this._culledGroundPlane;
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    }(THREE.PerspectiveCamera));
    //# sourceMappingURL=Camera.js.map

    var zero = new THREE.Vector3();
    // so camera.up is the orbit axis
    var quat = new THREE.Quaternion();
    var quatInverse = new THREE.Quaternion();
    var EPS = 0.000001;
    var v = new THREE.Vector3();
    var OrbitConstraint = /** @class */ (function () {
        function OrbitConstraint(map, camera, targetDistance) {
            this.minPolarAngle = 0.0;
            // maxPolarAngle: number = 0.48 * Math.PI;
            this.maxPolarAngle = 0.3 * Math.PI;
            this.minAzimuthAngle = -Infinity;
            this.maxAzimuthAngle = Infinity;
            this.enableDamping = true;
            this.dampingFactor = 0.75;
            this.maxClickTimeInterval = 500;
            this.theta = 0.0;
            this.phi = 0.0;
            this.thetaDelta = 0.0;
            this.phiDelta = 0.0;
            this.scale = 1.0;
            this.panOffset = new THREE.Vector3();
            this.zoomChanged = false;
            this.lastPosition = new THREE.Vector3();
            this.lastQuaternion = new THREE.Quaternion();
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
        OrbitConstraint.prototype.getPolarAngle = function () {
            return this.phi;
        };
        OrbitConstraint.prototype.getAzimuthalAngle = function () {
            return this.theta;
        };
        OrbitConstraint.prototype.rotateLeft = function (angle) {
            this.thetaDelta -= angle;
            // TODO:
            // compass.update();
        };
        OrbitConstraint.prototype.rotateUp = function (angle) {
            this.phiDelta -= angle;
            // TODO:
            // compass.update();
        };
        OrbitConstraint.prototype.panLeft = function (distance) {
            var te = this.camera.matrix.elements;
            // get X column of matrix
            v.set(te[0], te[1], te[2]);
            v.multiplyScalar(-distance);
            this.panOffset.add(v);
        };
        // pass in distance in world space to move up
        OrbitConstraint.prototype.panUp = function (distance) {
            var te = this.camera.matrix.elements;
            // get Y column of matrix
            v.set(te[4], /* te[ 5 ] */ 0, te[6]);
            v.multiplyScalar(distance);
            this.panOffset.add(v);
        };
        // pass in x,y of change desired in pixel space,
        // right and down are positive
        OrbitConstraint.prototype.pan = function (deltaX, deltaY, screenWidth, screenHeight) {
            // half of the fov is center to top of screen
            var t = this.targetDistance * Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(2 * deltaX * t / screenHeight);
            this.panUp(2 * deltaY * t / screenHeight);
        };
        OrbitConstraint.prototype.dollyIn = function (dollyScale) {
            this.scale /= dollyScale;
        };
        OrbitConstraint.prototype.dollyOut = function (dollyScale) {
            this.scale *= dollyScale;
        };
        /**
         * Update camera constrain
         * @returns {boolean}
         */
        OrbitConstraint.prototype.update = function () {
            var offset = this.camera.position;
            var target = this.camera.target;
            this.theta += this.thetaDelta;
            this.phi += this.phiDelta;
            this.targetDistance = this.targetDistance * this.scale;
            // Restrict theta to be between desired limits
            this.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.theta));
            // Restrict phi to be between desired limits
            this.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.phi));
            // Restrict phi to be betwee EPS and PI-EPS
            this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
            // Restrict radius to be between desired limits
            this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
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
            this.map._subscribeObjects.forEach(function (obj) { obj.updateTarget(target); });
            if (this.enableDamping === true) {
                this.thetaDelta *= (1.0 - this.dampingFactor);
                this.phiDelta *= (1.0 - this.dampingFactor);
            }
            else {
                this.thetaDelta = 0.0;
                this.phiDelta = 0.0;
            }
            this.scale = 1.0;
            this.panOffset.set(0, 0, 0);
            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            var t = new THREE.Vector3();
            if (this.lastPosition.distanceToSquared(t.addVectors(this.camera.position, this.camera.target)) > EPS ||
                8 * (1 - this.lastQuaternion.dot(this.camera.quaternion)) > EPS ||
                this.zoomChanged) {
                this.lastPosition.copy(t);
                this.lastQuaternion.copy(this.camera.quaternion);
                this.zoomChanged = false;
                if (this.map.quadTree) {
                    this.map.quadTree.needUpdate = true;
                }
                return true;
            }
            return false;
        };
        Object.defineProperty(OrbitConstraint.prototype, "target", {
            get: function () {
                return this.camera.target;
            },
            set: function (target) {
                this.camera.target = target;
            },
            enumerable: true,
            configurable: true
        });
        return OrbitConstraint;
    }());
    //# sourceMappingURL=OrbitConstraint.js.map

    function compare(modifiers) {
        if (typeof Qt === 'object') {
            return modifiers & Qt.ControlModifier;
        }
        return modifiers;
    }
    function getAutoRotationAngle(primitive) {
        return 2 * Math.PI / 60 / 60 * primitive.autoRotateSpeed;
    }
    function getZoomScale(delta) {
        delta = delta || 1;
        return Math.pow(0.999, delta);
    }
    var screenPosition$1 = new THREE.Vector2();
    var picker$2 = new THREE.Raycaster();
    var px$2 = new THREE.Vector3();
    function contextmenu(event) {
        event.preventDefault();
    }
    var OrbitControls = /** @class */ (function (_super) {
        __extends(OrbitControls, _super);
        function OrbitControls(options) {
            var _this = _super.call(this) || this;
            _this._map = options.map;
            _this.constraint = new OrbitConstraint(_this._map, _this._map.camera, MapSettings.cameraDistance);
            _this.eventSource = options.eventSource;
            _this.canvas = options.canvas;
            // Set to false to disable this control
            _this.enabled = true;
            // This option actually enables dollying in and out; left as "zoom" for
            // backwards compatibility.
            // Set to false to disable zooming
            _this.enableZoom = true;
            _this.zoomSpeed = 10;
            // Set to false to disable rotating
            _this.enableRotate = true;
            _this.rotateSpeed = 1.0;
            // Set to false to disable panning
            _this.enablePan = true;
            _this.keyPanSpeed = 5.0; // pixels moved per arrow key push
            // Set to true to automatically rotate around the target
            // If auto-rotate is enabled, you must call controls.update() in your animation loop
            _this.autoRotate = false;
            _this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
            // Set to false to disable use of the keys
            _this.enableKeys = true;
            // The four arrow keys
            _this.keys = typeof Qt === 'object'
                ? { LEFT: Qt.LeftArrow, UP: Qt.UpArrow, RIGHT: Qt.RightArrow, BOTTOM: Qt.DownArrow }
                : { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
            // Mouse buttons
            _this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
            /// /////////
            // internals
            var scope = _this;
            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();
            var panStart = new THREE.Vector2();
            var panEnd = new THREE.Vector2();
            var panDelta = new THREE.Vector2();
            var dollyStart = new THREE.Vector2();
            var dollyEnd = new THREE.Vector2();
            var dollyDelta = new THREE.Vector2();
            /**
             * State
             */
            _this._state = OrbitControls.STATE.NONE;
            _this._lastClick = null;
            /**
             * Is mouse down
             * @type {boolean}
             */
            _this._isMouseDown = false;
            _this._mode = OrbitControls.MODE.NONE;
            var intersected = null;
            // set start position
            // TODO: using property instead of location
            // setView(this, location.hash)
            // for reset
            _this.target0 = _this.target.clone();
            _this.position0 = _this.camera.position.clone();
            _this.zoom0 = _this.camera.zoom;
            // pass in x,y of change desired in pixel space,
            // right and down are positive
            var pan = function (deltaX, deltaY) {
                scope.constraint.pan(deltaX, deltaY, scope.canvas.width, scope.canvas.height);
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
                }
                else if (button === scope.mouseButtons.ZOOM) {
                    if (scope.enableZoom === false) {
                        return;
                    }
                    scope._state = OrbitControls.STATE.DOLLY;
                    dollyStart.set(x, y);
                }
                else if (button === scope.mouseButtons.PAN) {
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
                var now = Date.now();
                if (scope._lastClick) {
                    panEnd.set(x, y);
                    panDelta.subVectors(panEnd, panStart);
                    if (scope._isMouseDown && now - scope._lastClick <= 500 &&
                        Math.abs(panDelta.x) + Math.abs(panDelta.y) > 10 && scope.enablePan) {
                        if (scope._mode === OrbitControls.MODE.GUIDE) {
                            scope.target0.set(scope.target.x, 0, scope.target.z);
                            scope.constraint.target = scope.target0;
                            scope._mode = OrbitControls.MODE.NONE;
                        }
                        scope._state = OrbitControls.STATE.PAN;
                        scope._lastClick = null;
                    }
                    else if (now - scope._lastClick > 500) {
                        scope._lastClick = null;
                    }
                }
                if (scope._state === OrbitControls.STATE.NONE) {
                    // Hovering Rendering Object
                    MapUtility.rayCasterFromScreen(scope, x, y, picker$2);
                    var intersects = picker$2.intersectObjects(scope._map.currentMission.interactableObjects(), true);
                    if (intersects.length > 0) {
                        var targetObject = intersects[0].object;
                        if (targetObject !== intersected) {
                            if (intersected) {
                                intersected.material.opacity = intersected.currentOpacity;
                            }
                            intersected = targetObject;
                            intersected.currentOpacity = intersected.material.opacity;
                            intersected.material.opacity = 1.0;
                        }
                    }
                    else if (intersected) {
                        intersected.material.opacity = intersected.currentOpacity;
                        delete intersected.currentOpacity;
                        intersected = null;
                    }
                }
                else if (scope._state === OrbitControls.STATE.ROTATE) {
                    if (scope.enableRotate === false) {
                        return;
                    }
                    rotateEnd.set(x, y);
                    rotateDelta.subVectors(rotateEnd, rotateStart);
                    // rotating across whole screen goes 360 degrees around
                    scope.constraint.rotateLeft(2 * Math.PI * rotateDelta.x / scope.canvas.width * scope.rotateSpeed);
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.constraint.rotateUp(2 * Math.PI * rotateDelta.y / scope.canvas.height * scope.rotateSpeed);
                    rotateStart.copy(rotateEnd);
                }
                else if (scope._state === OrbitControls.STATE.DOLLY) {
                    if (scope.enableZoom === false) {
                        return;
                    }
                    dollyEnd.set(x, y);
                    dollyDelta.subVectors(dollyEnd, dollyStart);
                    if (dollyDelta.y > 0) {
                        scope.constraint.dollyIn(getZoomScale());
                    }
                    else if (dollyDelta.y < 0) {
                        scope.constraint.dollyOut(getZoomScale());
                    }
                    dollyStart.copy(dollyEnd);
                }
                else if (scope._state === OrbitControls.STATE.PAN) {
                    if (scope.enablePan === false) {
                        return;
                    }
                    panEnd.set(x, y);
                    panDelta.subVectors(panEnd, panStart);
                    pan(panDelta.x, panDelta.y);
                    panStart.copy(panEnd);
                }
                else if (!scope._map.currentMission.onMouseMove(scope, x, y)) {
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
                var delta = wheelY;
                scope.constraint.dollyOut(getZoomScale(delta));
                scope.update();
                // scope.dispatchEvent(startEvent);
                // scope.dispatchEvent(endEvent);
                // off-center zooming :D
                if (scope.camera.position.y >= scope.maxDistance) {
                    return;
                }
                var direction = -delta * 0.001001001;
                pan(direction * (x - scope.canvas.width / 2), direction * (y - scope.canvas.height / 2));
            }
            function onWebMouseWheel(event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.wheelDelta !== undefined) {
                    // WebKit / Opera / Explorer 9
                    onMouseWheel(event.clientX, event.clientY, 0, event.wheelDelta);
                }
                else if (event.detail !== undefined) {
                    // Firefox
                    onMouseWheel(event.clientX, event.clientY, 0, -event.detail);
                }
            }
            function onKeyDown(event) {
                if (scope.keyDown || scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) {
                    return;
                }
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
            function onKeyUp(event) {
                // TIMER: timer.
                if (typeof Qt === 'object') {
                    timer.clearInterval(scope.keyDown);
                }
                else {
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
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
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
                var element = scope._map._renderer.domElement === document ?
                    scope._map._renderer.domElement.body : scope._map._renderer.domElement;
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
                        scope.constraint.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                        // rotating up and down along whole screen attempts to go 360, but limited to 180
                        scope.constraint.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
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
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        dollyEnd.set(0, distance);
                        dollyDelta.subVectors(dollyEnd, dollyStart);
                        if (dollyDelta.y > 0) {
                            scope.constraint.dollyOut(getZoomScale());
                        }
                        else if (dollyDelta.y < 0) {
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
            _this.dispose = function () {
                if (typeof Qt === 'object') {
                    scope.eventSource.mouseDown.disconnect(onMouseDown);
                    scope.eventSource.mouseMove.disconnect(onMouseMove);
                    this.eventSource.mouseMove.disconnect(onMouseUp);
                    scope.eventSource.mouseWheel.disconnect(onMouseWheel);
                    scope.eventSource.keyDown.disconnect(onKeyDown);
                }
                else {
                    this._map._renderer.domElement.removeEventListener('contextmenu', contextmenu, false);
                    this._map._renderer.domElement.removeEventListener('mousedown', onWebMouseDown, false);
                    this._map._renderer.domElement.removeEventListener('mouseup', onWebMouseUp, false);
                    this._map._renderer.domElement.removeEventListener('mousemove', onWebMouseMove, false);
                    this._map._renderer.domElement.removeEventListener('mousewheel', onWebMouseWheel, false);
                    this._map._renderer.domElement.removeEventListener('touchstart', touchstart, false);
                    this._map._renderer.domElement.removeEventListener('touchend', touchend, false);
                    this._map._renderer.domElement.removeEventListener('touchmove', touchmove, false);
                }
            };
            // this.domElement.addEventListener( 'contextmenu', contextmenu, false );
            if (typeof Qt === 'object') {
                _this.eventSource.mouseDown.connect(onMouseDown);
                _this.eventSource.mouseMove.connect(onMouseMove);
                _this.eventSource.mouseUp.connect(onMouseUp);
                _this.eventSource.mouseWheel.connect(onMouseWheel);
                _this.eventSource.keyDown.connect(onKeyDown);
                _this.eventSource.keyUp.connect(onKeyUp);
            }
            else {
                _this._map._renderer.domElement.addEventListener('mousedown', onWebMouseDown, false);
                _this._map._renderer.domElement.addEventListener('mousemove', onWebMouseMove, false);
                _this._map._renderer.domElement.addEventListener('mouseup', onWebMouseUp, false);
                _this._map._renderer.domElement.addEventListener('mousewheel', onWebMouseWheel, false);
                _this._map._renderer.domElement.addEventListener('touchstart', touchstart, false);
                _this._map._renderer.domElement.addEventListener('touchend', touchend, false);
                _this._map._renderer.domElement.addEventListener('touchmove', touchmove, false);
            }
            // force an update at start
            _this.update();
            return _this;
        }
        OrbitControls.prototype.getPolarAngle = function () {
            return this.constraint.getPolarAngle();
        };
        OrbitControls.prototype.getAzimuthalAngle = function () {
            return this.constraint.getAzimuthalAngle();
        };
        OrbitControls.prototype.update = function () {
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
        };
        OrbitControls.prototype.reset = function () {
            this._state = OrbitControls.STATE.NONE;
            this.camera.target.copy(this.target0);
            this.camera.position.copy(this.position0);
            this.camera.zoom = this.zoom0;
            this.camera.updateProjectionMatrix();
            // this.dispatchEvent(changeEvent);
            this.update();
        };
        /**
         * Set camrea view
         * @param {Cartographic} position - Cartographic position
         * @param {number} zoom - Zoom distance
         * @param {number} duration
         */
        OrbitControls.prototype.setView = function (position, zoom, duration) {
            // TODO: duration as animation
            duration = duration || 0;
            sphericalMercator.CartographicToPixel(position, px$2);
            // FIXME: Y = elevation data
            this.constraint.camera.target.set(px$2.x, 0, px$2.z);
            this.constraint.targetDistance = Math.pow(0.5, zoom) * MapSettings.cameraDistance;
            this.update();
            // camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            // this.quadTree.needUpdate = true;
        };
        OrbitControls.prototype.guide = function (vehicle) {
            this._mode = OrbitControls.MODE.GUIDE;
            this.target0 = this.constraint.target.clone();
            this.constraint.target = vehicle.position;
            this.constraint.targetDistance = vehicle.height * 2;
            this.update();
        };
        Object.defineProperty(OrbitControls.prototype, "camera", {
            get: function () { return this.constraint.camera; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "target", {
            get: function () { return this.constraint.target; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "minDistance", {
            get: function () { return this.constraint.minDistance; },
            set: function (value) { this.constraint.minDistance = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "maxDistance", {
            get: function () { return this.constraint.maxDistance; },
            set: function (value) { this.constraint.maxDistance = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "minPolarAngle", {
            // get minZoom() { return this.constraint.minZoom; }
            // set minZoom(value) { this.constraint.minZoom = value; }
            // get maxZoom() { return this.constraint.maxZoom; }
            // set maxZoom(value) { this.constraint.maxZoom = value; }
            get: function () { return this.constraint.minPolarAngle; },
            set: function (value) { this.constraint.minPolarAngle = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "maxPolarAngle", {
            get: function () { return this.constraint.maxPolarAngle; },
            set: function (value) { this.constraint.maxPolarAngle = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "minAzimuthAngle", {
            get: function () { return this.constraint.minAzimuthAngle; },
            set: function (value) { this.constraint.minAzimuthAngle = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "maxAzimuthAngle", {
            get: function () { return this.constraint.maxAzimuthAngle; },
            set: function (value) { this.constraint.maxAzimuthAngle = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "enableDamping", {
            get: function () { return this.constraint.enableDamping; },
            set: function (value) { this.constraint.enableDamping = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OrbitControls.prototype, "dampingFactor", {
            get: function () { return this.constraint.dampingFactor; },
            set: function (value) { this.constraint.dampingFactor = value; },
            enumerable: true,
            configurable: true
        });
        OrbitControls.STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
        OrbitControls.MODE = { NONE: -1, GUIDE: 0 };
        return OrbitControls;
    }(THREE.EventDispatcher));
    //# sourceMappingURL=OrbitControls.js.map

    var GeometricHelper = /** @class */ (function () {
        function GeometricHelper() {
        }
        GeometricHelper.pointInsidePolygon = function (polygon, pt) {
            // Ray-casting algorithm only 2D x-z
            var x = pt.x;
            var z = pt.z;
            var inside = false;
            for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                var xi = polygon[i].x;
                var zi = polygon[i].z;
                var xj = polygon[j].x;
                var zj = polygon[j].z;
                var intersect = ((zi >= z) !== (zj >= z)) &&
                    (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
                if (intersect) {
                    inside = !inside;
                }
            }
            return inside;
            // return inside([pt.x, pt.z], polygon.map(function (p) { return [p.x, p.z]; }));
            // return classifyPoint(polygon.map(function (p) { return [p.x, p.z]; }), [pt.x, pt.z]) < 1;
        };
        GeometricHelper.lineIntersects = function (l1, l2) {
            var a = l1[0].x;
            var b = l1[0].z;
            var c = l1[1].x;
            var d = l1[1].z;
            var p = l2[0].x;
            var q = l2[0].z;
            var r = l2[1].x;
            var s = l2[1].z;
            var det;
            var gamma;
            var lambda;
            det = (c - a) * (s - q) - (r - p) * (d - b);
            if (det === 0) {
                return false;
            }
            else {
                lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
                gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
                return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
            }
            // const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
            //         ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
            // const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
            //         ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
            // if (isNaN(x) || isNaN(y)) {
            //     return false;
            // } else {
            //     if (x1 >= x2) {
            //         if (!between(x2, x, x1)) { return false; }
            //     } else {
            //         if (!between(x1, x, x2)) { return false; }
            //     }
            //     if (y1 >= y2) {
            //         if (!between(y2, y, y1)) { return false; }
            //     } else {
            //         if (!between(y1, y, y2)) { return false; }
            //     }
            //     if (x3 >= x4) {
            //         if (!between(x4, x, x3)) { return false; }
            //     } else {
            //         if (!between(x3, x, x4)) { return false; }
            //     }
            //     if (y3 >= y4) {
            //         if (!between(y4, y, y3)) { return false; }
            //     } else {
            //         if (!between(y3, y, y4)) { return false; }
            //     }
            // }
            // return true;
        };
        return GeometricHelper;
    }());
    //# sourceMappingURL=GeometricHelper.js.map

    var Pool = /** @class */ (function () {
        function Pool(options) {
            this._length = options.size || 16;
            this._usingNodes = {};
            this._freeNodes = [];
            this.create = options.instance.createMesh;
            for (var i = 0; i < this._length; i++) {
                this._freeNodes.push(this.create());
            }
        }
        Pool.prototype.duplicate = function () {
            var length = this._length;
            for (var i = 0; i < length; i++) {
                this._freeNodes.push(this.create());
            }
            this._length *= 2;
        };
        Pool.prototype.get = function (index) {
            if (!this._usingNodes[index]) {
                throw new Error(index + " isn't in used.");
            }
            return this._usingNodes[index];
        };
        Pool.prototype.use = function (index) {
            var node = this._freeNodes.pop();
            this._usingNodes[index] = node;
            return node;
        };
        Pool.prototype.free = function (index) {
            var node = this._usingNodes[index];
            delete this._usingNodes[index];
            this._freeNodes.push(node);
        };
        Object.defineProperty(Pool.prototype, "length", {
            get: function () {
                return this._length;
            },
            enumerable: true,
            configurable: true
        });
        return Pool;
    }());
    //# sourceMappingURL=Pool.js.map

    var TileReplacementQueue = /** @class */ (function () {
        function TileReplacementQueue() {
            this.head = undefined;
            this.tail = undefined;
            this.count = 0;
            this._lastBeforeStartOfFrame = undefined;
        }
        /**
         * Marks the start of the render frame.  Tiles before (closer to the head) this tile in the
         * list were used last frame and must not be unloaded.
         */
        TileReplacementQueue.prototype.markStartOfRenderFrame = function () {
            this._lastBeforeStartOfFrame = this.head;
        };
        /**
         * Reduces the size of the queue to a specified size by unloading the least-recently used
         * tiles.  Tiles that were used last frame will not be unloaded, even if that puts the number
         * of tiles above the specified maximum.
         *
         * @param {Number} maximumTiles The maximum number of tiles in the queue.
         */
        TileReplacementQueue.prototype.trimTiles = function (maximumTiles) {
            var tileToTrim = this.tail;
            var keepTrimming = true;
            while (keepTrimming &&
                this._lastBeforeStartOfFrame &&
                this.count > maximumTiles &&
                tileToTrim) {
                // Stop trimming after we process the last tile not used in the
                // current frame.
                keepTrimming = tileToTrim !== this._lastBeforeStartOfFrame;
                var previous = tileToTrim.replacementPrevious;
                if (tileToTrim.eligibleForUnloading) {
                    remove(this, tileToTrim);
                    tileToTrim.dispose();
                }
                tileToTrim = previous;
            }
            // if (this.count > maximumTiles) {
            // let tileToTrim2 = this.tail;
            // while(tileToTrim2) {
            //     const previous = tileToTrim2.replacementPrevious;
            //     console.log(tileToTrim2.stringify, tileToTrim2.quadTree._activeTiles.indexOf(tileToTrim2))
            //     tileToTrim2 = previous;
            // }
            // }
        };
        TileReplacementQueue.prototype.markTileRendered = function (item) {
            var head = this.head;
            if (head === item) {
                if (item === this._lastBeforeStartOfFrame) {
                    this._lastBeforeStartOfFrame = item.replacementNext;
                }
                return;
            }
            ++this.count;
            if (!head) {
                // no other tiles in the list
                item.replacementPrevious = undefined;
                item.replacementNext = undefined;
                this.head = item;
                this.tail = item;
                return;
            }
            if (item.replacementPrevious || item.replacementNext) {
                // tile already in the list, remove from its current location
                remove(this, item);
            }
            item.replacementPrevious = undefined;
            item.replacementNext = head;
            head.replacementPrevious = item;
            this.head = item;
        };
        return TileReplacementQueue;
    }());
    function remove(tileReplacementQueue, item) {
        var previous = item.replacementPrevious;
        var next = item.replacementNext;
        if (item === tileReplacementQueue._lastBeforeStartOfFrame) {
            tileReplacementQueue._lastBeforeStartOfFrame = next;
        }
        if (item === tileReplacementQueue.head) {
            tileReplacementQueue.head = next;
        }
        else {
            previous.replacementNext = next;
        }
        if (item === tileReplacementQueue.tail) {
            tileReplacementQueue.tail = previous;
        }
        else {
            next.replacementPrevious = previous;
        }
        item.replacementPrevious = undefined;
        item.replacementNext = undefined;
        --tileReplacementQueue.count;
    }
    //# sourceMappingURL=TileReplacementQueue.js.map

    var QuadTree = /** @class */ (function () {
        function QuadTree(options) {
            this._map = options.map;
            this.scene = options.map.scene;
            this.tiles = new THREE.Group();
            this.tiles.name = 'Tiles';
            this.scene.add(this.tiles);
            this.cameraController = options.map.cameraController;
            this.camera = options.map.camera;
            this._rootTile = options.mode.createRootTile(this);
            /**
             * Scene mode
             * @type {SceneMode}
             */
            this.mode = options.mode;
            this._activeTiles = [];
            this._tileLoadQueueHigh = []; // high priority tiles are preventing refinement
            this._tileLoadQueueMedium = []; // medium priority tiles are being rendered
            this._tileLoadQueueLow = []; // low priority tiles were refined past or are non-visible parts of quads.
            this._tileReplacementQueue = new TileReplacementQueue();
            this._loadQueueTimeSlice = 5.0;
            this.maximumScreenSpaceError = options.maximumScreenSpaceError || 2;
            this.tileCacheSize = options.tileCacheSize || 256;
            this.maxDepth = 22;
            this._lastTileLoadQueueLength = 0;
            this.needUpdate = true;
            this._debug = {
                enableDebugOutput: true,
                maxDepth: 0,
                tilesVisited: 0,
                tilesCulled: 0,
                tilesRendered: 0,
                tilesWaitingForChildren: 0,
                lastMaxDepth: -1,
                lastTilesVisited: -1,
                lastTilesCulled: -1,
                lastTilesRendered: -1,
                lastTilesWaitingForChildren: -1,
                suspendLodUpdate: false,
            };
            this._pool = new Pool({
                instance: this.mode.instance,
            });
        }
        QuadTree.prototype.suspendLodUpdate = function (value) {
            this._debug.suspendLodUpdate = value;
        };
        QuadTree.prototype.update = function () {
            // If not thing need to update, do noting
            if (!this.needUpdate || this._debug.suspendLodUpdate) {
                return;
            }
            this.needUpdate = false;
            // Compute frustum of camera
            this.camera.update();
            clearTileLoadQueue(this);
            this._tileReplacementQueue.markStartOfRenderFrame();
            selectTilesForRendering(this);
            renderTiles(this, this._activeTiles);
            processTileLoadQueue(this);
            updateTileLoadProgress(this);
            this.camera.updatedLastFrame = false;
        };
        return QuadTree;
    }());
    function clearTileLoadQueue(primitive) {
        var debug = primitive._debug;
        debug.maxDepth = 0;
        debug.tilesVisited = 0;
        debug.tilesCulled = 0;
        debug.tilesRendered = 0;
        debug.tilesWaitingForChildren = 0;
        primitive._tileLoadQueueHigh.length = 0;
        primitive._tileLoadQueueMedium.length = 0;
        primitive._tileLoadQueueLow.length = 0;
    }
    function selectTilesForRendering(primitive) {
        var debug = primitive._debug;
        // Clear the render list.
        var tilesToRender = primitive._activeTiles;
        tilesToRender.length = 0;
        // We can't render anything before the level zero tiles exist.
        // var tileProvider = primitive._tileProvider;
        var tile;
        var rootTiles = primitive._rootTile;
        // Our goal with load ordering is to first load all of the tiles we need to
        // render the current scene at full detail.  Loading any other tiles is just
        // a form of prefetching, and we need not do it at all (other concerns aside).  This
        // simple and obvious statement gets more complicated when we realize that, because
        // we don't have bounding volumes for the entire terrain tile pyramid, we don't
        // precisely know which tiles we need to render the scene at full detail, until we do
        // some loading.
        //
        // So our load priority is (from high to low):
        // 1. Tiles that we _would_ render, except that they're not sufficiently loaded yet.
        //    Ideally this would only include tiles that we've already determined to be visible,
        //    but since we don't have reliable visibility information until a tile is loaded,
        //    and because we (currently) must have all children in a quad renderable before we
        //    can refine, this pretty much means tiles we'd like to refine to, regardless of
        //    visibility. (high)
        // 2. Tiles that we're rendering. (medium)
        // 3. All other tiles. (low)
        //
        // Within each priority group, tiles should be loaded in approximate near-to-far order,
        // but currently they're just loaded in our traversal order which makes no guarantees
        // about depth ordering.
        // Traverse in depth-first, near-to-far order.
        for (var i = 0, len = rootTiles.length; i < len; ++i) {
            tile = rootTiles[i];
            primitive._tileReplacementQueue.markTileRendered(tile);
            if (!tile.renderable) {
                if (tile.needsLoading) {
                    primitive._tileLoadQueueHigh.push(tile);
                }
                ++debug.tilesWaitingForChildren;
            }
            else if (computeTileVisibility(primitive, tile)) {
                visitTile(primitive, tile);
            }
            else {
                if (tile.needsLoading) {
                    primitive._tileLoadQueueLow.push(tile);
                }
                ++debug.tilesCulled;
            }
        }
    }
    function visitTile(primitive, tile) {
        var debug = primitive._debug;
        ++debug.tilesVisited;
        primitive._tileReplacementQueue.markTileRendered(tile);
        if (tile.z > debug.maxDepth) {
            debug.maxDepth = tile.z;
        }
        if (primitive.mode.screenSpaceError(primitive, tile) < primitive.maximumScreenSpaceError) {
            // This tile meets SSE requirements, so render it.
            if (tile.needsLoading) {
                // Rendered tile meeting SSE loads with medium priority.
                primitive._tileLoadQueueMedium.push(tile);
            }
            addTileToRenderList(primitive, tile);
            return;
        }
        var allAreRenderable = tile.children[0].renderable && tile.children[1].renderable
            && tile.children[2].renderable && tile.children[3].renderable;
        var allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent &&
            tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;
        if (allAreRenderable) {
            if (allAreUpsampled) {
                // No point in rendering the children because they're all upsampled.  Render this tile instead.
                addTileToRenderList(primitive, tile);
                // Load the children even though we're (currently) not going to render them.
                // A tile that is "upsampled only" right now might change its tune once it does more loading.
                // A tile that is upsampled now and forever should also be done loading, so no harm done.
                queueChildLoadNearToFar(primitive, primitive.camera.target, tile.children);
                if (tile.needsLoading) {
                    // Rendered tile that's not waiting on children loads with medium priority.
                    primitive._tileLoadQueueMedium.push(tile);
                }
            }
            else {
                // SSE is not good enough and children are loaded, so refine.
                // No need to add the children to the load queue because
                // they'll be added (if necessary) when they're visited.
                visitVisibleChildrenNearToFar(primitive, tile.children);
                if (tile.needsLoading) {
                    // Tile is not rendered, so load it with low priority.
                    primitive._tileLoadQueueLow.push(tile);
                }
            }
        }
        else {
            // We'd like to refine but can't because not all of our children are
            // renderable.  Load the refinement blockers with high priority and
            // render this tile in the meantime.
            queueChildLoadNearToFar(primitive, primitive.camera.target, tile.children);
            addTileToRenderList(primitive, tile);
            if (tile.needsLoading) {
                // We will refine this tile when it's possible, so load this tile only with low priority.
                primitive._tileLoadQueueLow.push(tile);
            }
        }
    }
    function queueChildLoadNearToFar(primitive, cameraPosition, children) {
        if (cameraPosition.x < children[0].bbox.xMax) {
            if (cameraPosition.z < children[0].bbox.zMax) {
                // Camera in northwest quadrant
                queueChildTileLoad(primitive, children[0]);
                queueChildTileLoad(primitive, children[2]);
                queueChildTileLoad(primitive, children[1]);
                queueChildTileLoad(primitive, children[3]);
            }
            else {
                // Camera in southwest quadrant
                queueChildTileLoad(primitive, children[2]);
                queueChildTileLoad(primitive, children[0]);
                queueChildTileLoad(primitive, children[3]);
                queueChildTileLoad(primitive, children[1]);
            }
        }
        else if (cameraPosition.z < children[0].bbox.zMax) {
            // Camera northeast quadrant
            queueChildTileLoad(primitive, children[1]);
            queueChildTileLoad(primitive, children[3]);
            queueChildTileLoad(primitive, children[0]);
            queueChildTileLoad(primitive, children[2]);
        }
        else {
            // Camera in northeast quadrant
            queueChildTileLoad(primitive, children[3]);
            queueChildTileLoad(primitive, children[1]);
            queueChildTileLoad(primitive, children[2]);
            queueChildTileLoad(primitive, children[0]);
        }
    }
    function queueChildTileLoad(primitive, childTile) {
        // Tile is deeper than max stop
        if (childTile.z > primitive.maxDepth) {
            return;
        }
        primitive._tileReplacementQueue.markTileRendered(childTile);
        if (childTile.needsLoading) {
            if (childTile.renderable) {
                primitive._tileLoadQueueLow.push(childTile);
            }
            else {
                // A tile blocking refine loads with high priority
                primitive._tileLoadQueueHigh.push(childTile);
            }
        }
    }
    function visitVisibleChildrenNearToFar(primitive, children) {
        var distances = children.map(function (child) {
            return { tile: child, distance: child.bbox.distanceFromPoint(primitive.camera.target) };
        });
        distances.sort(function (a, b) {
            return a.distance - b.distance;
        });
        distances.forEach(function (_a) {
            var tile = _a.tile;
            return visitIfVisible(primitive, tile);
        });
    }
    function computeTileVisibility(primitive, tile) {
        if (tile.z <= 10) {
            var camera = primitive.cameraController.camera;
            var matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            var frustum = new THREE.Frustum().setFromMatrix(matrix);
            // TODO: using AABB to Culling
            return frustum.intersectsObject(tile.mesh);
        }
        var i;
        var corner = tile.bbox.corner;
        for (i = 0; i < 4; i++) {
            if (GeometricHelper.pointInsidePolygon(corner, primitive.camera.culledGroundPlane[i])) {
                return true;
            }
        }
        for (i = 0; i < 4; i++) {
            if (GeometricHelper.pointInsidePolygon(primitive.camera.culledGroundPlane, corner[i])) {
                return true;
            }
        }
        for (i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var l1 = [corner[i], corner[(i + 1) % 4]];
                var l2 = [primitive.camera.culledGroundPlane[j], primitive.camera.culledGroundPlane[(j + 1) % 4]];
                if (GeometricHelper.lineIntersects(l1, l2)) {
                    return true;
                }
            }
        }
    }
    function visitIfVisible(primitive, tile) {
        if (computeTileVisibility(primitive, tile)) {
            visitTile(primitive, tile);
        }
        else {
            ++primitive._debug.tilesCulled;
            primitive._tileReplacementQueue.markTileRendered(tile);
            // We've decided this tile is not visible, but if it's not fully loaded yet, we've made
            // this determination based on possibly-incorrect information.  We need to load this
            // culled tile with low priority just in case it turns out to be visible after all.
            if (tile.needsLoading) {
                primitive._tileLoadQueueLow.push(tile);
            }
        }
    }
    function addTileToRenderList(primitive, tile) {
        primitive._activeTiles.push(tile);
        ++primitive._debug.tilesRendered;
    }
    function renderTiles(primitive, tiles) {
        if (tiles.length === 0) {
            return;
        }
        var pool = primitive._pool;
        while (tiles.length > pool.length) {
            pool.duplicate();
        }
        primitive.tiles.children.length = 0;
        var target = primitive.camera.target;
        tiles.forEach(function (tile) {
            // Recalculate tile position
            var center = tile.bbox.center;
            var mesh = tile.mesh;
            mesh.position.set(center.x - target.x, center.y - target.y, center.z - target.z);
            tile.applyDataToMesh(mesh);
            primitive.tiles.add(mesh);
        });
    }
    function processTileLoadQueue(primitive) {
        var tileLoadQueueHigh = primitive._tileLoadQueueHigh;
        var tileLoadQueueMedium = primitive._tileLoadQueueMedium;
        var tileLoadQueueLow = primitive._tileLoadQueueLow;
        if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
            return;
        }
        // Remove any tiles that were not used this frame beyond the number
        // we're allowed to keep.
        primitive._tileReplacementQueue.trimTiles(primitive.tileCacheSize);
        var endTime = Date.now() + primitive._loadQueueTimeSlice;
        processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueHigh);
        processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueMedium);
        processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueLow);
    }
    function processSinglePriorityLoadQueue(primitive, endTime, loadQueue) {
        var _loop_1 = function (i, len) {
            var tile = loadQueue[i];
            primitive._tileReplacementQueue.markTileRendered(tile);
            primitive.mode.providers.forEach(function (provider) { return provider.loadTile(tile); });
        };
        for (var i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
            _loop_1(i, len);
        }
    }
    function updateTileLoadProgress(primitive) {
        var currentLoadQueueLength = primitive._tileLoadQueueHigh.length +
            primitive._tileLoadQueueMedium.length +
            primitive._tileLoadQueueLow.length;
        if (currentLoadQueueLength !== primitive._lastTileLoadQueueLength) {
            primitive._lastTileLoadQueueLength = currentLoadQueueLength;
        }
        var debug = primitive._debug;
        if (debug.enableDebugOutput && !debug.suspendLodUpdate) {
            if (debug.tilesVisited !== debug.lastTilesVisited ||
                debug.tilesRendered !== debug.lastTilesRendered ||
                debug.tilesCulled !== debug.lastTilesCulled ||
                debug.maxDepth !== debug.lastMaxDepth ||
                debug.tilesWaitingForChildren !== debug.lastTilesWaitingForChildren) {
                console.info('Visited ' + debug.tilesVisited + ', Rendered: ' + debug.tilesRendered +
                    ', Culled: ' + debug.tilesCulled + ', Max Depth: ' + debug.maxDepth +
                    ', Waiting for children: ' + debug.tilesWaitingForChildren);
                debug.lastTilesVisited = debug.tilesVisited;
                debug.lastTilesRendered = debug.tilesRendered;
                debug.lastTilesCulled = debug.tilesCulled;
                debug.lastMaxDepth = debug.maxDepth;
                debug.lastTilesWaitingForChildren = debug.tilesWaitingForChildren;
            }
        }
    }

    var Map3D = /** @class */ (function () {
        function Map3D(options) {
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
            var skybox = new Skybox();
            this.scene.add(skybox);
            /**
             * @type {Vehicle}
             */
            this.vehicle = new Vehicle({ map: this });
            this.state = Map3D.State.GROUND;
        }
        Object.defineProperty(Map3D.prototype, "currentMission", {
            get: function () {
                if (!this._currentMission) {
                    this._currentMission = new Polygon({ map: this });
                    this.missions.push(this._currentMission);
                }
                return this._currentMission;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map3D.prototype, "vehiclePosition", {
            get: function () {
                return this.vehicle.position;
            },
            set: function (cartographic) {
                this.vehicle.position = cartographic;
            },
            enumerable: true,
            configurable: true
        });
        Map3D.prototype.newMission = function (type) {
            this._currentMission = (type === 'Polyline') ? new Polyline({ map: this }) : new Polygon({ map: this });
            this.missions.push(this._currentMission);
            return this._currentMission;
        };
        Map3D.prototype.update = function () {
            // Quad Tree update
            this.quadTree.update();
            // Mission update
            var scale = this.cameraController.constraint.targetDistance *
                sphericalMercator.mPerPixel() * 4.0 / this.canvas.height;
            this.vehicle.setScale(scale);
            this.missions.forEach(function (mission) {
                mission.pins.forEach(function (pin) {
                    pin.setScale(scale);
                });
            });
        };
        Map3D.prototype.generateGrid = function (type) {
            this._currentMission.generateGrid(type || 'opt', 4);
        };
        Map3D.prototype.guide = function () {
            this.cameraController.guide(this.vehicle);
        };
        Map3D.prototype.setView = function (position, zoom) {
            this.cameraController.setView(position, zoom);
        };
        Map3D.prototype.resizeView = function (canvas) {
            this.camera.aspect = canvas.width / canvas.height;
            this.camera.updateProjectionMatrix();
            if (this._renderer.setPixelRatio) {
                this._renderer.setPixelRatio(canvas.devicePixelRatio);
            }
            this._renderer.setSize(canvas.width, canvas.height);
        };
        Map3D.prototype.addSubscribeObject = function (object) {
            this._subscribeObjects.push(object);
        };
        Map3D.prototype.removeSubscribeObject = function (object) {
            var index = this._subscribeObjects.indexOf(object);
            if (index !== -1) {
                this._subscribeObjects.splice(index, 1);
            }
            return this;
        };
        Map3D.State = {
            GROUND: 0,
            TAKEOFF: 1,
        };
        return Map3D;
    }());
    //# sourceMappingURL=Map3D.js.map

    //# sourceMappingURL=index.js.map

    var TilingScheme = /** @class */ (function () {
        function TilingScheme(options) {
            this._ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);
            this._numberOfLevelZeroTilesX = options.numberOfLevelZeroTilesX;
            this._numberOfLevelZeroTilesY = options.numberOfLevelZeroTilesY;
        }
        TilingScheme.prototype.getNumberOfXTilesAtLevel = function (level) {
            return this._numberOfLevelZeroTilesX << level;
        };
        TilingScheme.prototype.getNumberOfYTilesAtLevel = function (level) {
            return this._numberOfLevelZeroTilesY << level;
        };
        Object.defineProperty(TilingScheme.prototype, "ellipsoid", {
            get: function () { return this._ellipsoid; },
            enumerable: true,
            configurable: true
        });
        return TilingScheme;
    }());
    //# sourceMappingURL=TilingScheme.js.map

    var DataSource = /** @class */ (function () {
        function DataSource(options) {
            var _this = this;
            if (!options) {
                throw new Error('DataSource must provided arguments.');
            }
            if (!options.layers) {
                throw new Error('DataSource must provided options.layers');
            }
            if (!options.tile) {
                throw new Error('DataSource must provided options.tile');
            }
            /**
             * @type {DataSourceLayer[]}
             */
            this._layers = options.layers;
            /**
             * @type {Tile}
             */
            this._tile = options.tile;
            /**
             * @type {Object}
             */
            this.status = {};
            Object.keys(this._layers).forEach(function (key) {
                _this.status[key] = DataSource.State.Idle;
            });
        }
        /**
         * @param {string} layer - Layer name
         */
        DataSource.prototype.loading = function (layer) {
            if (typeof this._layers[layer] === 'undefined') {
                throw new Error('Unknowed layer was trigger datasource.');
            }
            this._layers[layer].processLoading(this._tile);
        };
        DataSource.prototype.loaded = function (layer, data) {
            if (!this._tile) {
                // TODO: Dispose;
                return;
            }
            if (this._tile.disposed) {
                return;
            }
            if (typeof this._layers[layer] === 'undefined') {
                throw new Error('Unknowed layer was trigger datasource.');
            }
            this._layers[layer].processData(this._tile, data);
            if (this.done) {
                this._tile.quadTree.needUpdate = true;
            }
        };
        DataSource.prototype.failed = function (layer, error) {
            if (typeof this.status[layer] === 'undefined') {
                throw new Error('Unknowed layer was trigger datasource.');
            }
            this._layers[layer].processError(this._tile, error);
        };
        DataSource.prototype.isLoading = function (layer) {
            return this.status[layer] >= DataSource.State.Loading;
        };
        DataSource.prototype.dispose = function () {
            var _this = this;
            Object.keys(this._layers).forEach(function (key) {
                _this.status[key] = DataSource.State.Idle;
            });
            this._tile = undefined;
        };
        DataSource.toLayers = function (layers) {
            return layers.reduce(function (prev, Instance) {
                prev[Instance.layerName] = new Instance();
                return prev;
            }, {});
        };
        Object.defineProperty(DataSource.prototype, "done", {
            get: function () {
                var _this = this;
                return Object.keys(this._layers).reduce(function (prev, key) {
                    return prev && _this.status[key] === DataSource.State.Loaded;
                }, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataSource.prototype, "needsLoading", {
            get: function () {
                var _this = this;
                return Object.keys(this._layers).reduce(function (prev, key) {
                    return prev || _this.status[key] < DataSource.State.Loaded;
                }, false);
            },
            enumerable: true,
            configurable: true
        });
        DataSource.State = {
            Idle: 1,
            Loading: 2,
            Loaded: 3,
            Failed: 4,
        };
        return DataSource;
    }());
    //# sourceMappingURL=DataSource.js.map

    var DataSourceLayer = /** @class */ (function () {
        function DataSourceLayer() {
        }
        DataSourceLayer.layerName = 'none';
        return DataSourceLayer;
    }());
    //# sourceMappingURL=DataSourceLayer.js.map

    var ImageDataLayer = /** @class */ (function (_super) {
        __extends(ImageDataLayer, _super);
        function ImageDataLayer() {
            return _super.call(this) || this;
        }
        ImageDataLayer.prototype.processLoading = function (tile) {
            tile.data.status[ImageDataLayer.layerName] = DataSource.State.Loading;
        };
        ImageDataLayer.prototype.processData = function (tile, data) {
            if (tile.material) {
                throw new Error('Material\'s already set up.');
            }
            tile.material = new THREE.MeshBasicMaterial({
                map: data,
            });
            tile.data.status[ImageDataLayer.layerName] = DataSource.State.Loaded;
        };
        ImageDataLayer.prototype.processError = function (tile, error) {
            tile.data.status[ImageDataLayer.layerName] = DataSource.State.Idle;
        };
        ImageDataLayer.layerName = 'texture';
        return ImageDataLayer;
    }(DataSourceLayer));
    //# sourceMappingURL=ImageDataLayer.js.map

    var Provider = /** @class */ (function () {
        function Provider(options) {
            options = options || {};
            this._maxLoad = options.maxLoad || 50;
            this._loading = 0;
        }
        return Provider;
    }());
    //# sourceMappingURL=Provider.js.map

    var ImageryProvider = /** @class */ (function (_super) {
        __extends(ImageryProvider, _super);
        function ImageryProvider(options) {
            return _super.call(this, options) || this;
        }
        ImageryProvider.prototype.url = function (x, y, z) {
            var serverIndex = 2 * (x % 2) + y % 2;
            var server = ['a', 'b', 'c', 'd'][serverIndex];
            return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.satellite/' + z + '/' + x + '/' + y +
                '@2x.png?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
        };
        ImageryProvider.prototype.loadTile = function (tile) {
            var _this = this;
            if (this._loading >= this._maxLoad || tile.data.isLoading(ImageDataLayer.layerName)) {
                return;
            }
            var onComplete = function (resp) {
                _this._needUpdate = true;
                _this._loading--;
                if (tile.disposed) {
                    return;
                }
                tile.data.loaded(ImageDataLayer.layerName, texture);
            };
            var onError = function (err) {
                if (err) {
                    if (tile.disposed) {
                        return;
                    }
                    _this._loading--;
                    console.error('Error loading texture' + tile.stringify);
                    tile.data.failed(ImageDataLayer.layerName, err);
                }
            };
            this._loading++;
            var texture = new THREE.TextureLoader()
                .load(this.url(tile.x, tile.y, tile.z), onComplete.bind(this), undefined, onError.bind(this));
            tile.data.loading(ImageDataLayer.layerName);
        };
        return ImageryProvider;
    }(Provider));
    //# sourceMappingURL=ImageryProvider.js.map

    var UNIT_Y = new Cartesian({ x: 0.0, y: 1.0, z: 0.0 });
    var t$1 = [[0, 0], [0, 1], [1, 1], [1, 0]];
    var c = new Cartesian();
    var cameraCartesianPosition = new Cartesian();
    var AABB = /** @class */ (function () {
        function AABB(options) {
            this.xMin = options.topLeftCorner.x || 0;
            this.yMin = options.topLeftCorner.y || 0;
            this.zMin = options.topLeftCorner.z || 0;
            this.xMax = options.bottomRightCorner.x || 0;
            this.yMax = options.bottomRightCorner.y || 0;
            this.zMax = options.bottomRightCorner.z || 0;
            // Compute the normal of the plane on the western edge of the tile.
            var midPoint = new Cartesian();
            midPoint.x = (this.xMax + this.xMin) / 2;
            midPoint.z = (this.zMax + this.zMin) / 2;
            var temp2 = new Cartesian();
            var westernMidpointCartesian = new Cartesian();
            westernMidpointCartesian.x = (this.xMax + this.xMin) / 2;
            westernMidpointCartesian.z = this.zMin;
            this.westNormal = new Cartesian();
            this.westNormal.crossVectors(temp2.subVectors(midPoint, westernMidpointCartesian), UNIT_Y);
            this.westNormal.normalize();
            var easternMidpointCartesian = new Cartesian();
            easternMidpointCartesian.x = (this.xMax + this.xMin) / 2;
            easternMidpointCartesian.z = this.zMax;
            this.eastNormal = new Cartesian();
            this.eastNormal.crossVectors(temp2.subVectors(midPoint, easternMidpointCartesian), UNIT_Y);
            this.eastNormal.normalize();
            var northMidpointCartesian = new Cartesian();
            northMidpointCartesian.x = this.xMax;
            northMidpointCartesian.z = (this.zMax + this.zMin) / 2;
            this.northNormal = new Cartesian();
            this.northNormal.crossVectors(temp2.subVectors(midPoint, northMidpointCartesian), UNIT_Y);
            this.northNormal.normalize();
            var southMidpointCartesian = new Cartesian();
            southMidpointCartesian.x = this.xMin;
            southMidpointCartesian.z = (this.zMax + this.zMin) / 2;
            this.southNormal = new Cartesian();
            this.southNormal.crossVectors(temp2.subVectors(midPoint, southMidpointCartesian), UNIT_Y);
            this.southNormal.normalize();
            this.northwestCornnerCartesian = new Cartesian({ x: this.xMin, y: 0, z: this.zMin });
            this.southeastCornnerCartesian = new Cartesian({ x: this.xMax, y: 0, z: this.zMax });
            this._corner = new Array(4);
            for (var i = 0; i < 4; ++i) {
                // TODO: y
                this._corner[i] = new Cartesian({
                    x: t$1[i][0] ? this.xMin : this.xMax,
                    y: 0,
                    z: t$1[i][1] ? this.zMin : this.zMax,
                });
            }
        }
        AABB.prototype.intersects = function (x, y, z) {
            if (x instanceof AABB) {
                var other = x;
                return this.xMin < other.xMax && other.xMin < this.xMax &&
                    this.yMin < other.yMax && other.yMin < this.yMax &&
                    this.zMin < other.zMax && other.zMin < this.zMax;
            }
            return this.xMin <= x && this.xMax >= x &&
                this.yMin <= y && this.yMax >= y &&
                this.zMin <= z && this.zMax >= z;
        };
        AABB.prototype.onRect = function (x, z) {
            return this.xMin <= x && this.xMax >= x &&
                this.zMin <= z && this.zMax >= z;
        };
        AABB.prototype.distanceToCamera = function (camera) {
            cameraCartesianPosition.set(camera.position.x + camera.target.x, camera.position.y + camera.target.y, camera.position.z + camera.target.z);
            return this.distanceFromPoint(cameraCartesianPosition);
        };
        AABB.prototype.distanceFromPoint = function (cartesian) {
            var temp = new Cartesian();
            var result = 0.0;
            if (!this.onRect(cartesian.x, cartesian.z)) {
                var northwestCornnerCartesian = this.northwestCornnerCartesian;
                var southeastCornnerCartesian = this.southeastCornnerCartesian;
                var westNormal = this.westNormal;
                var southNormal = this.southNormal;
                var eastNormal = this.eastNormal;
                var northNormal = this.northNormal;
                var vectorFromNorthwestCorner = temp.subVectors(cartesian, northwestCornnerCartesian);
                var distanceToWestPlane = vectorFromNorthwestCorner.dot(westNormal);
                var distanceToNorthPlane = vectorFromNorthwestCorner.dot(northNormal);
                var vectorFromSoutheastCorner = temp.subVectors(cartesian, southeastCornnerCartesian);
                var distanceToEastPlane = vectorFromSoutheastCorner.dot(eastNormal);
                var distanceToSouthPlane = vectorFromSoutheastCorner.dot(southNormal);
                if (distanceToWestPlane > 0.0) {
                    result += distanceToWestPlane * distanceToWestPlane;
                }
                else if (distanceToEastPlane > 0.0) {
                    result += distanceToEastPlane * distanceToEastPlane;
                }
                if (distanceToSouthPlane > 0.0) {
                    result += distanceToSouthPlane * distanceToSouthPlane;
                }
                else if (distanceToNorthPlane > 0.0) {
                    result += distanceToNorthPlane * distanceToNorthPlane;
                }
            }
            var height = cartesian.height;
            var distanceFromTop = height;
            if (distanceFromTop > 0.0) {
                result += distanceFromTop * distanceFromTop;
            }
            return Math.sqrt(result);
        };
        Object.defineProperty(AABB.prototype, "corner", {
            get: function () {
                return this._corner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AABB.prototype, "center", {
            get: function () {
                c.set((this.xMin + this.xMax) / 2, (this.yMin + this.yMax) / 2, (this.zMin + this.zMax) / 2);
                return c;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AABB.prototype, "width", {
            get: function () {
                return this.xMax - this.xMin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AABB.prototype, "height", {
            get: function () {
                return this.zMax - this.zMin;
            },
            enumerable: true,
            configurable: true
        });
        return AABB;
    }());
    //# sourceMappingURL=AABB.js.map

    var topLeftCorner = new Cartesian();
    var bottomRightCorner = new Cartesian();
    var SceneMode = /** @class */ (function () {
        function SceneMode(options) {
            this._topLeftCartographicCorner = QtPositioning.coordinate();
            this._bottomRightCartographicCorner = QtPositioning.coordinate();
            this.getLevelMaximumGeometricError = function (level) {
                return this._levelZeroMaximumGeometricError / (1 << level);
            };
            this._instance = options.instance;
        }
        SceneMode.prototype.fog = function (distanceToCamera, density) {
            var scalar = distanceToCamera * density;
            return 1.0 - Math.exp(-(scalar * scalar));
        };
        SceneMode.prototype.screenSpaceError = function (quadTree, tile) {
            var camera = quadTree.camera;
            var maxGeometricError = this.getLevelMaximumGeometricError(tile.z);
            // Update distance of tile from camera
            if (camera.updatedLastFrame || !tile.distance) {
                tile.distance = tile.bbox.distanceToCamera(quadTree.camera);
            }
            var height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
            var sseDenominator = 2 * Math.tan(camera.fov * Math.PI / (2 * 180));
            var error = (maxGeometricError * height) / (tile.distance * sseDenominator);
            // TODO: Fof from Cesium
            // if (frameState.fog.enabled) {
            error = error - this.fog(tile.distance, 2.0e-4) * 2.0;
            // }
            return error;
        };
        SceneMode.prototype.getAABB = function (tile) {
            // FIXME: FC
            var width = 360.0 / this._tilingScheme.getNumberOfXTilesAtLevel(tile.z);
            var height = 180.0 / this._tilingScheme.getNumberOfYTilesAtLevel(tile.z);
            this._topLeftCartographicCorner.longitude = tile.x * width - 180.0;
            this._topLeftCartographicCorner.altitude = 0;
            this._topLeftCartographicCorner.latitude = 90.0 - tile.y * height;
            sphericalMercator.FCartographicToCartesian(this._topLeftCartographicCorner, topLeftCorner);
            this._bottomRightCartographicCorner.longitude = (tile.x + 1) * width - 180.0;
            this._bottomRightCartographicCorner.altitude = 0;
            this._bottomRightCartographicCorner.latitude = 90.0 - (tile.y + 1) * height;
            sphericalMercator.FCartographicToCartesian(this._bottomRightCartographicCorner, bottomRightCorner);
            return new AABB({ topLeftCorner: topLeftCorner, bottomRightCorner: bottomRightCorner });
        };
        SceneMode.prototype.createRootTile = function (quadTree) {
            var numberOfLevelZeroTilesX = this._tilingScheme.getNumberOfXTilesAtLevel(0);
            var numberOfLevelZeroTilesY = this._tilingScheme.getNumberOfYTilesAtLevel(0);
            var result = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);
            var index = 0;
            for (var y = 0; y < numberOfLevelZeroTilesY; ++y) {
                for (var x = 0; x < numberOfLevelZeroTilesX; ++x) {
                    result[index++] = new this._instance({
                        x: x,
                        y: y,
                        z: 0,
                        quadTree: quadTree,
                    });
                }
            }
            return result;
        };
        Object.defineProperty(SceneMode.prototype, "instance", {
            get: function () { return this._instance; },
            enumerable: true,
            configurable: true
        });
        return SceneMode;
    }());
    //# sourceMappingURL=SceneMode.js.map

    var size = Array.apply(null, Array(32)).map(function (_, idx) {
        return MapSettings.basePlaneDimension / Math.pow(2, idx);
    });
    var Tile = /** @class */ (function () {
        function Tile(options) {
            this._x = options.x;
            this._y = options.y;
            this._z = options.z;
            this._quadTree = options.quadTree;
            // QuadTreeTile structure
            this._parent = options.parent;
            // State
            this._state = Tile.State.Start;
            this._replacementPrevious = undefined;
            this._replacementNext = undefined;
            this._distance = undefined;
            this._bbox = undefined;
            this.upsampledFromParent = false;
            this._mesh = this.constructor.createMesh();
        }
        Tile.createMesh = function () {
            throw new Error('No createMesh in abstract Tile.');
        };
        Tile.prototype.dispose = function () {
            // Remove link betweem parent
            if (this._parent) {
                for (var i = 0; i < 4; i++) {
                    if (this._parent._children[i] && this.stringify === this._parent._children[i].stringify) {
                        this._parent._children[i] = undefined;
                    }
                }
            }
            this._parent = undefined;
            this._state = Tile.State.Removed;
            this._bbox = undefined;
            this.upsampledFromParent = false;
            this.data.dispose();
            if (this._children) {
                for (var j = 0; j < 4; ++j) {
                    if (this._children[j]) {
                        this._children[j].dispose();
                        this._children[j] = undefined;
                    }
                }
            }
            this._quadTree = undefined;
        };
        Tile.size = function (z) {
            return size[z];
        };
        Object.defineProperty(Tile.prototype, "x", {
            get: function () { return this._x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "y", {
            get: function () { return this._y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "z", {
            get: function () { return this._z; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "children", {
            get: function () {
                if (typeof this._children === 'undefined') {
                    this._children = new Array(4);
                }
                // FIXME: Type of instance
                var Instance = this.constructor;
                for (var i = 0; i < 4; ++i) {
                    if (typeof this._children[i] === 'undefined') {
                        this._children[i] = new Instance({
                            x: this._x * 2 + i % 2,
                            // Rounding float to integer ex. ~~2.5 = 2
                            y: this._y * 2 + (~~(i / 2)) % 2,
                            z: this._z + 1,
                            parent: this,
                            quadTree: this._quadTree,
                        });
                    }
                }
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "replacementPrevious", {
            get: function () { return this._replacementPrevious; },
            set: function (tile) { this._replacementPrevious = tile; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "replacementNext", {
            get: function () { return this._replacementNext; },
            set: function (tile) { this._replacementNext = tile; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "distance", {
            get: function () { return this._distance; },
            set: function (distance) { this._distance = distance; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "bbox", {
            get: function () {
                if (!this._bbox) {
                    this._bbox = this._quadTree.mode.getAABB(this);
                }
                return this._bbox;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "quadTree", {
            get: function () { return this._quadTree; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "state", {
            /************************
             * State handling
             ***********************/
            get: function () { throw new Error('derpercate'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "needsLoading", {
            get: function () { return this.data.needsLoading; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "renderable", {
            get: function () { return this.data.done; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "eligibleForUnloading", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "disposed", {
            get: function () { return this._state === Tile.State.Removed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "stringify", {
            get: function () { return this._x + '/' + this._y + '/' + this._z; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "mesh", {
            get: function () {
                return this._mesh;
            },
            enumerable: true,
            configurable: true
        });
        Tile.State = {
            Start: 0,
            Loading: 1,
            Done: 2,
            Failed: 3,
            Removed: 4,
        };
        return Tile;
    }());
    //# sourceMappingURL=Tile.js.map

    var image = new Image();
    var Tile2D = /** @class */ (function (_super) {
        __extends(Tile2D, _super);
        function Tile2D(options) {
            var _this = _super.call(this, options) || this;
            _this.data = new DataSource({
                layers: Tile2D.dataLayers,
                tile: _this,
            });
            return _this;
        }
        Tile2D.createMesh = function () {
            var material = null;
            var geometry = new THREE.PlaneGeometry(1, 1);
            geometry.rotateX(-Math.PI / 2);
            return new THREE.Mesh(geometry, material);
        };
        Tile2D.prototype.applyDataToMesh = function (mesh) {
            var tileSize = Tile.size(this.z);
            mesh.scale.set(tileSize, 1, tileSize);
            if (!this._material) {
                throw new Error("Material not ready to use. " + this.stringify);
            }
            mesh.material = this._material;
        };
        Tile2D.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this._material) {
                this._material.dispose();
            }
            this._material = undefined;
        };
        Object.defineProperty(Tile2D.prototype, "material", {
            get: function () { return this._material; },
            set: function (m) { this._material = m; },
            enumerable: true,
            configurable: true
        });
        Tile2D.dataLayers = DataSource.toLayers([ImageDataLayer]);
        return Tile2D;
    }(Tile));
    //# sourceMappingURL=Tile2D.js.map

    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var Scene2D = /** @class */ (function (_super) {
        __extends(Scene2D, _super);
        function Scene2D() {
            var _this = _super.call(this, {
                instance: Tile2D,
            }) || this;
            _this._tilingScheme = new TilingScheme({
                numberOfLevelZeroTilesX: 1,
                numberOfLevelZeroTilesY: 1,
            });
            _this.providers = [
                new ImageryProvider(),
            ];
            _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 65, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
            return _this;
        }
        return Scene2D;
    }(SceneMode));
    //# sourceMappingURL=Scene2D.js.map

    var EPSG4326MapImageDataLayer = /** @class */ (function (_super) {
        __extends(EPSG4326MapImageDataLayer, _super);
        function EPSG4326MapImageDataLayer() {
            return _super.call(this) || this;
        }
        EPSG4326MapImageDataLayer.prototype.processLoading = function (tile) {
            tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Loading;
        };
        EPSG4326MapImageDataLayer.prototype.processData = function (tile, data) {
            if (tile.material) {
                throw new Error('Material\'s already set up.');
            }
            var uniforms = {
                texture: { type: 't', value: data[0] },
                texture2: { type: 't', value: data[1] },
            };
            tile.material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: EPSG4326MapImageDataLayer.vertexShader,
                fragmentShader: EPSG4326MapImageDataLayer.fragmentShader,
            });
            tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Loaded;
        };
        EPSG4326MapImageDataLayer.prototype.processError = function (tile, error) {
            tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Idle;
        };
        EPSG4326MapImageDataLayer.layerName = 'EPSG:4326';
        EPSG4326MapImageDataLayer.vertexShader = "\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vViewPosition;\n\n        void main() {\n\n            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n            vUv = uv;\n            vNormal = normalize( normalMatrix * normal );\n            vViewPosition = -mvPosition.xyz;\n\n            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n        }\n    ";
        EPSG4326MapImageDataLayer.fragmentShader = "\n        uniform sampler2D texture;\n        uniform sampler2D texture2;\n        uniform vec3 color;\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vViewPosition;\n\n        void main() {\n            if ( vUv.y < 0.5) {\n                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 );\n                gl_FragColor = texture2D( texture2, halfvUv );\n            } else {\n                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 - 1.0 );\n                gl_FragColor = texture2D( texture, halfvUv );\n            }\n\n            // hack in a fake pointlight at camera location, plus ambient\n            // vec3 normal = normalize( vNormal );\n            // vec3 lightDir = normalize( vViewPosition );\n\n            // float dotProduct = max( dot( normal, lightDir ), 0.0 ) + 0.2;\n\n            // //gl_FragColor = vec4( mix( tColor.rgb, tColor2.rgb, tColor2.a ), 1.0 ) * dotProduct;\n\n            // vec4 mix_c = tColor2 + tc * tColor2.a;\n            // gl_FragColor = vec4( mix( tColor.rgb, mix_c.xyz, tColor2.a ), 1.0 ) * dotProduct;\n            // gl_FragColor = vec4( vUv.x, vUv.y, 0.0, 1.0 );\n        }\n    ";
        return EPSG4326MapImageDataLayer;
    }(DataSourceLayer));
    //# sourceMappingURL=EPSG4326MapImageDataLayer.js.map

    var EPSG4326MapImageryProvider = /** @class */ (function (_super) {
        __extends(EPSG4326MapImageryProvider, _super);
        function EPSG4326MapImageryProvider(options) {
            var _this = _super.call(this, options) || this;
            _this._ready = false;
            options = options || {};
            var key = options.key || 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';
            var meta = new XMLHttpRequest();
            meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);
            var onMetaComplete = function () {
                var response = JSON.parse(meta.response);
                var resources = response.resourceSets[0].resources[0];
                _this._baseUrl = resources.imageUrl;
                _this._subdomains = resources.imageUrlSubdomains;
                _this._zoomMax = resources.zoomMax;
                _this._zoomMin = resources.zoomMin - 1;
                _this._ready = true;
            };
            meta.addEventListener('load', onMetaComplete.bind(_this));
            meta.send(null);
            return _this;
        }
        EPSG4326MapImageryProvider.prototype.tileXYToQuadKey = function (x, y, level) {
            var quadkey = '';
            for (var i = level; i >= 0; --i) {
                var bitmask = 1 << i;
                var digit = 0;
                if ((x & bitmask) !== 0) {
                    digit |= 1;
                }
                if ((y & bitmask) !== 0) {
                    digit |= 2;
                }
                quadkey += digit;
            }
            return quadkey;
        };
        EPSG4326MapImageryProvider.prototype.url = function (x, y, z) {
            var subdomains = this._subdomains;
            var subdomainIndex = (x + y + z) % subdomains.length;
            var replaceParameters = {
                subdomain: subdomains[subdomainIndex],
                quadkey: this.tileXYToQuadKey(x, y, z),
            };
            var url = Object.keys(replaceParameters).reduce(function (prev, key) {
                var value = replaceParameters[key];
                return prev.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
            }, this._baseUrl);
            return url;
        };
        EPSG4326MapImageryProvider.prototype.loadTile = function (tile) {
            var _this = this;
            if (!this._ready) {
                tile.quadTree.needUpdate = true;
                return;
            }
            if (this._loading >= this._maxLoad || tile.data.isLoading(EPSG4326MapImageDataLayer.layerName)) {
                return;
            }
            // FIXME: Debugging
            // if (tile.z >= 1) return;
            var doneCount = 0;
            var onComplete = function (resp) {
                _this._needUpdate = true;
                _this._loading--;
                if (tile.disposed) {
                    return;
                }
                doneCount++;
                if (doneCount === 2) {
                    tile.data.loaded(EPSG4326MapImageDataLayer.layerName, [t0, t1]);
                }
            };
            var onError = function (err) {
                if (err) {
                    if (tile.disposed) {
                        return;
                    }
                    _this._loading--;
                    console.error('Error loading texture' + tile.stringify);
                    tile.data.failed(EPSG4326MapImageDataLayer.layerName, err);
                }
            };
            this._loading++;
            var t0 = new THREE.TextureLoader()
                .load(this.url(tile.x, tile.y * 2, tile.z), onComplete.bind(this), undefined, onError.bind(this));
            var t1 = new THREE.TextureLoader()
                .load(this.url(tile.x, tile.y * 2 + 1, tile.z), onComplete.bind(this), undefined, onError.bind(this));
            tile.data.loading(EPSG4326MapImageDataLayer.layerName);
        };
        return EPSG4326MapImageryProvider;
    }(Provider));
    //# sourceMappingURL=EPSG4326MapImageryProvider.js.map

    var image$1 = new Image();
    var TestTile = /** @class */ (function (_super) {
        __extends(TestTile, _super);
        function TestTile(options) {
            var _this = _super.call(this, options) || this;
            _this.data = new DataSource({
                layers: TestTile.dataLayers,
                tile: _this,
            });
            return _this;
        }
        TestTile.createMesh = function () {
            var material = new THREE.MeshBasicMaterial({
                wireframe: true,
                opacity: 0,
            });
            var geometry = new THREE.PlaneGeometry(1, 1);
            geometry.rotateX(-Math.PI / 2);
            return new THREE.Mesh(geometry, material);
        };
        TestTile.prototype.applyDataToMesh = function (mesh) {
            // const tileSize = Tile.size(this.z);
            // mesh.scale.set(tileSize / 2, 1, tileSize);
            var tileSize = Tile.size(this.z);
            mesh.material = this._material;
            mesh.scale.set(tileSize / 2, 10, tileSize);
        };
        TestTile.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(TestTile.prototype, "material", {
            get: function () { return this._material; },
            set: function (m) { this._material = m; },
            enumerable: true,
            configurable: true
        });
        TestTile.dataLayers = DataSource.toLayers([EPSG4326MapImageDataLayer]);
        return TestTile;
    }(Tile));
    //# sourceMappingURL=TestTile.js.map

    function getEstimatedLevelZeroGeometricErrorForAHeightmap$1(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TestScene = /** @class */ (function (_super) {
        __extends(TestScene, _super);
        function TestScene() {
            var _this = _super.call(this, {
                instance: TestTile,
            }) || this;
            _this._tilingScheme = new TilingScheme({
                numberOfLevelZeroTilesX: 2,
                numberOfLevelZeroTilesY: 1,
            });
            _this.providers = [
                new EPSG4326MapImageryProvider(),
            ];
            _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap$1(_this._tilingScheme.ellipsoid, 65, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
            return _this;
        }
        return TestScene;
    }(SceneMode));
    //# sourceMappingURL=TestScene.js.map

    var BingMapImageryProvider = /** @class */ (function (_super) {
        __extends(BingMapImageryProvider, _super);
        function BingMapImageryProvider(options) {
            var _this = _super.call(this, options) || this;
            _this._ready = false;
            options = options || {};
            var key = options.key || 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';
            var meta = new XMLHttpRequest();
            meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);
            var onMetaComplete = function () {
                var response = JSON.parse(meta.response);
                var resources = response.resourceSets[0].resources[0];
                _this._baseUrl = resources.imageUrl;
                _this._subdomains = resources.imageUrlSubdomains;
                _this._zoomMax = resources.zoomMax;
                _this._zoomMin = resources.zoomMin - 1;
                _this._ready = true;
            };
            meta.addEventListener('load', onMetaComplete.bind(_this));
            meta.send(null);
            return _this;
        }
        BingMapImageryProvider.prototype.tileXYToQuadKey = function (x, y, level) {
            var quadkey = '';
            for (var i = level; i >= 0; --i) {
                var bitmask = 1 << i;
                var digit = 0;
                if ((x & bitmask) !== 0) {
                    digit |= 1;
                }
                if ((y & bitmask) !== 0) {
                    digit |= 2;
                }
                quadkey += digit;
            }
            return quadkey;
        };
        BingMapImageryProvider.prototype.url = function (x, y, z) {
            var subdomains = this._subdomains;
            var subdomainIndex = (x + y + z) % subdomains.length;
            var replaceParameters = {
                subdomain: subdomains[subdomainIndex],
                quadkey: this.tileXYToQuadKey(x, y, z),
            };
            var url = Object.keys(replaceParameters).reduce(function (prev, key) {
                var value = replaceParameters[key];
                return prev.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
            }, this._baseUrl);
            return url;
        };
        BingMapImageryProvider.prototype.loadTile = function (tile) {
            if (!this._ready) {
                tile.quadTree.needUpdate = true;
                return;
            }
            _super.prototype.loadTile.call(this, tile);
        };
        return BingMapImageryProvider;
    }(ImageryProvider));
    //# sourceMappingURL=BingMapImageryProvider.js.map

    function getEstimatedLevelZeroGeometricErrorForAHeightmap$2(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var BingMapScene = /** @class */ (function (_super) {
        __extends(BingMapScene, _super);
        function BingMapScene() {
            var _this = _super.call(this, {
                instance: Tile2D,
            }) || this;
            _this._tilingScheme = new TilingScheme({
                numberOfLevelZeroTilesX: 2,
                numberOfLevelZeroTilesY: 2,
            });
            _this.providers = [
                new BingMapImageryProvider(),
            ];
            _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap$2(_this._tilingScheme.ellipsoid, 45, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
            return _this;
        }
        return BingMapScene;
    }(SceneMode));
    //# sourceMappingURL=BingMapScene.js.map

    function highwaterDecode(indices) {
        var arr = [];
        var highest = 0;
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < indices.length; ++i) {
            var code = indices[i];
            arr.push(highest - code);
            if (code === 0) {
                ++highest;
            }
        }
        return arr;
    }
    function zigZagDecode(value) {
        return (value >> 1) ^ (-(value & 1));
    }
    function getUint32Array(data, startPos, count) {
        return new Uint32Array(data.slice(startPos, startPos + 4 * count));
    }
    function getUint32(data, startPos) {
        return getUint32Array(data, startPos, 1)[0];
    }
    function getUint16Array(data, startPos, count) {
        return new Uint16Array(data.slice(startPos, startPos + 2 * count));
    }
    function getFloat64Array(data, startPos, count) {
        return new Float64Array(data.slice(startPos, startPos + 8 * count));
    }
    function getFloat64(data, startPos) {
        return getFloat64Array(data, startPos, 1)[0];
    }
    function getFloat32Array(data, startPos, count) {
        return new Float32Array(data.slice(startPos, startPos + 4 * count));
    }
    function getFloat32(data, startPos) {
        return getFloat32Array(data, startPos, 1)[0];
    }
    var UINT16_BYTE_SIZE = 2;
    var UINT32_BYTE_SIZE = 4;
    //# sourceMappingURL=TypeConversion.js.map

    var maxShort = 32767;
    var STKTerrainDataLayer = /** @class */ (function (_super) {
        __extends(STKTerrainDataLayer, _super);
        function STKTerrainDataLayer() {
            return _super.call(this) || this;
        }
        STKTerrainDataLayer.prototype.getVertices = function (header, uArray, vArray, heightArray, indexArray) {
            return uArray.reduce(function (prev, _, index) {
                prev.push(new THREE.Vector3(uArray[index] / maxShort - 0.5, MapUtility.lerp(header.minimumHeight, header.maximumHeight, heightArray[index] / maxShort)
                    + header.minimumHeight, 0.5 - vArray[index] / maxShort));
                return prev;
            }, []);
        };
        STKTerrainDataLayer.prototype.getFaces = function (header, uArray, vArray, heightArray, indexArray) {
            var faces = [];
            for (var i = 0; i < indexArray.length; i += 3) {
                faces.push(new THREE.Face3(indexArray[i + 0], indexArray[i + 1], indexArray[i + 2]));
            }
            return faces;
        };
        STKTerrainDataLayer.prototype.getFaceVertexUvs = function (header, uArray, vArray, heightArray, indexArray) {
            var verticesUv = uArray.reduce(function (prev, _, index) {
                prev.push(new THREE.Vector2(uArray[index] / 32767, vArray[index] / 32767));
                return prev;
            }, []);
            var faceVertexUvs = [];
            for (var i = 0; i < indexArray.length; i += 3) {
                faceVertexUvs.push([
                    verticesUv[indexArray[i + 0]],
                    verticesUv[indexArray[i + 1]],
                    verticesUv[indexArray[i + 2]],
                ]);
            }
            return faceVertexUvs;
        };
        STKTerrainDataLayer.prototype.processLoading = function (tile) {
            tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Loading;
        };
        STKTerrainDataLayer.prototype.processData = function (tile, data) {
            var header = data.header;
            var uArray = data.uArray;
            var vArray = data.vArray;
            var heightArray = data.heightArray;
            var indexArray = data.indexArray;
            var vertices = this.getVertices(header, uArray, vArray, heightArray, indexArray);
            var faces = this.getFaces(header, uArray, vArray, heightArray, indexArray);
            tile.geometry = new THREE.Geometry();
            tile.geometry.vertices = vertices;
            tile.geometry.faces = faces;
            tile.geometry.computeFaceNormals();
            tile.geometry.computeVertexNormals();
            tile.geometry.faceVertexUvs[0] = this.getFaceVertexUvs(header, uArray, vArray, heightArray, indexArray);
            tile.geometry.uvsNeedUpdate = true;
            // tile.bbox.yMin = header.minimumHeight;
            // tile.bbox.yMax = header.maximumHeight;
            // console.log(tile.bbox.center, header.centerX, header.centerY, header.centerZ)
            tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Loaded;
        };
        STKTerrainDataLayer.prototype.processError = function (tile, error) {
            tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Idle;
        };
        STKTerrainDataLayer.layerName = 'terrain-stk';
        return STKTerrainDataLayer;
    }(DataSourceLayer));
    //# sourceMappingURL=STKTerrainDataLayer.js.map

    var STKTerrainProvider = /** @class */ (function (_super) {
        __extends(STKTerrainProvider, _super);
        function STKTerrainProvider(options) {
            var _this = _super.call(this, options) || this;
            _this._ready = false;
            var meta = new XMLHttpRequest();
            // meta.open('GET', 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/layer.json', true);
            meta.open('GET', './layer.json', true);
            var onMetaComplete = function () {
                var response = JSON.parse(meta.response);
                _this._baseUrl = "http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/" + response.tiles;
                _this._zoomMax = response.maxzoom;
                _this._zoomMin = response.minzoom;
                _this._version = response.version;
                _this._projection = response.projection;
                _this._ready = true;
            };
            meta.setRequestHeader('Accept', 'application/json,*/*;q=0.01');
            meta.addEventListener('load', onMetaComplete.bind(_this));
            meta.send(null);
            return _this;
        }
        STKTerrainProvider.prototype.url = function (x, y, z) {
            var replaceParameters = {
                x: x,
                y: (1 << z) - 1 - y,
                z: z,
                version: this._version,
            };
            var url = Object.keys(replaceParameters).reduce(function (prev, key) {
                var value = replaceParameters[key];
                return prev.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
            }, this._baseUrl);
            return url;
        };
        STKTerrainProvider.prototype.getHeader = function (data, byteCount) {
            return {
                bytes: data.byteLength,
                centerX: getFloat64(data, byteCount),
                centerY: getFloat64(data, byteCount + 8),
                centerZ: getFloat64(data, byteCount + 16),
                minimumHeight: getFloat32(data, byteCount + 24),
                maximumHeight: getFloat32(data, byteCount + 28),
                boundingSphereCenterX: getFloat64(data, byteCount + 32),
                boundingSphereCenterY: getFloat64(data, byteCount + 40),
                boundingSphereCenterZ: getFloat64(data, byteCount + 48),
                boundingSphereRadius: getFloat64(data, byteCount + 56),
                horizonOcclusionPointX: getFloat64(data, byteCount + 64),
                horizonOcclusionPointY: getFloat64(data, byteCount + 72),
                horizonOcclusionPointZ: getFloat64(data, byteCount + 80),
            };
        };
        STKTerrainProvider.prototype.parseTile = function (data) {
            var byteCount = 0;
            var header = this.getHeader(data, byteCount);
            byteCount += 88;
            var vertexCount = getUint32(data, byteCount);
            byteCount += UINT32_BYTE_SIZE;
            var uArray = getUint16Array(data, byteCount, vertexCount);
            byteCount += vertexCount * UINT16_BYTE_SIZE;
            var vArray = getUint16Array(data, byteCount, vertexCount);
            byteCount += vertexCount * UINT16_BYTE_SIZE;
            var heightArray = getUint16Array(data, byteCount, vertexCount);
            byteCount += vertexCount * UINT16_BYTE_SIZE;
            var i;
            var u = 0;
            var v = 0;
            var height = 0;
            for (i = 0; i < uArray.length; ++i) {
                u += zigZagDecode(uArray[i]);
                v += zigZagDecode(vArray[i]);
                height += zigZagDecode(heightArray[i]);
                uArray[i] = u;
                vArray[i] = v;
                heightArray[i] = height;
            }
            if (byteCount % 2 !== 0) {
                byteCount += (2 - (byteCount % 2));
            }
            var triangleCount = getUint32(data, byteCount);
            byteCount += UINT32_BYTE_SIZE;
            var indices = getUint16Array(data, byteCount, triangleCount * 3);
            byteCount += triangleCount * 3 * 2;
            var indexArray = highwaterDecode(indices);
            return { header: header, uArray: uArray, vArray: vArray, heightArray: heightArray, indexArray: indexArray };
        };
        STKTerrainProvider.prototype.loadTile = function (tile) {
            var _this = this;
            if (!this._ready) {
                tile.quadTree.needUpdate = true;
                return;
            }
            if (this._loading >= this._maxLoad || tile.data.isLoading(STKTerrainDataLayer.layerName)) {
                return;
            }
            // FIXME: Debugging
            // if (tile.z >= 1) return;
            this._loading++;
            var onComplete = function (resp) {
                _this._needUpdate = true;
                _this._loading--;
                if (tile.disposed) {
                    return;
                }
                tile.data.loaded(STKTerrainDataLayer.layerName, _this.parseTile(xhr.response));
            };
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.url(tile.x, tile.y, tile.z), true);
            xhr.setRequestHeader('Accept', ' application/vnd.quantized-mesh,application/octet-stream;q=1.0');
            xhr.responseType = 'arraybuffer';
            xhr.onload = onComplete;
            xhr.send(null);
            tile.data.loading(STKTerrainDataLayer.layerName);
        };
        return STKTerrainProvider;
    }(Provider));
    //# sourceMappingURL=STKTerrainProvider.js.map

    var image$2 = new Image();
    var STKTerrainTile = /** @class */ (function (_super) {
        __extends(STKTerrainTile, _super);
        function STKTerrainTile(options) {
            var _this = _super.call(this, options) || this;
            _this.data = new DataSource({
                layers: STKTerrainTile.dataLayers,
                tile: _this,
            });
            return _this;
        }
        STKTerrainTile.createMesh = function () {
            var material = new THREE.MeshBasicMaterial({
                wireframe: true,
                opacity: 0,
            });
            var geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);
            return new THREE.Mesh(geometry, material);
        };
        STKTerrainTile.prototype.applyDataToMesh = function (mesh) {
            var tileSize = Tile.size(this.z);
            mesh.material = this._material;
            mesh.scale.set(this.bbox.width, 1, this.bbox.height);
            mesh.geometry = this._geometry;
            mesh.position.y = this.bbox.yMin;
        };
        STKTerrainTile.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(STKTerrainTile.prototype, "geometry", {
            get: function () { return this._geometry; },
            set: function (g) { this._geometry = g; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(STKTerrainTile.prototype, "material", {
            get: function () { return this._material; },
            set: function (m) { this._material = m; },
            enumerable: true,
            configurable: true
        });
        STKTerrainTile.dataLayers = DataSource.toLayers([
            EPSG4326MapImageDataLayer,
            STKTerrainDataLayer,
        ]);
        return STKTerrainTile;
    }(Tile));
    //# sourceMappingURL=STKTerrainTile.js.map

    function getEstimatedLevelZeroGeometricErrorForAHeightmap$3(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var topLeftCorner$1 = new Cartesian();
    var bottomRightCorner$1 = new Cartesian();
    var STKTerrainScene = /** @class */ (function (_super) {
        __extends(STKTerrainScene, _super);
        function STKTerrainScene() {
            var _this = _super.call(this, {
                instance: STKTerrainTile,
            }) || this;
            _this._tilingScheme = new TilingScheme({
                numberOfLevelZeroTilesX: 2,
                numberOfLevelZeroTilesY: 1,
            });
            _this.providers = [
                new EPSG4326MapImageryProvider(),
                new STKTerrainProvider(),
            ];
            _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap$3(_this._tilingScheme.ellipsoid, 45, _this._tilingScheme.getNumberOfYTilesAtLevel(0));
            return _this;
        }
        return STKTerrainScene;
    }(SceneMode));
    //# sourceMappingURL=STKTerrainScene.js.map

    //# sourceMappingURL=index.js.map

    //# sourceMappingURL=index.js.map

    exports.Map3D = Map3D;
    exports.Scene2D = Scene2D;
    exports.TestScene = TestScene;
    exports.BingMapScene = BingMapScene;
    exports.STKTerrainScene = STKTerrainScene;

    return exports;

}({},THREE));
//# sourceMappingURL=terra.iife.js.map
