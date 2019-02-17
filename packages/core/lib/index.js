var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("rollup.config", ["lodash.camelcase", "rollup-plugin-commonjs", "rollup-plugin-json", "rollup-plugin-node-resolve", "rollup-plugin-sourcemaps", "rollup-plugin-typescript2"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var lodash_camelcase_1, rollup_plugin_commonjs_1, rollup_plugin_json_1, rollup_plugin_node_resolve_1, rollup_plugin_sourcemaps_1, rollup_plugin_typescript2_1, pkg, libraryName;
    return {
        setters: [
            function (lodash_camelcase_1_1) {
                lodash_camelcase_1 = lodash_camelcase_1_1;
            },
            function (rollup_plugin_commonjs_1_1) {
                rollup_plugin_commonjs_1 = rollup_plugin_commonjs_1_1;
            },
            function (rollup_plugin_json_1_1) {
                rollup_plugin_json_1 = rollup_plugin_json_1_1;
            },
            function (rollup_plugin_node_resolve_1_1) {
                rollup_plugin_node_resolve_1 = rollup_plugin_node_resolve_1_1;
            },
            function (rollup_plugin_sourcemaps_1_1) {
                rollup_plugin_sourcemaps_1 = rollup_plugin_sourcemaps_1_1;
            },
            function (rollup_plugin_typescript2_1_1) {
                rollup_plugin_typescript2_1 = rollup_plugin_typescript2_1_1;
            }
        ],
        execute: function () {
            // tslint:disable-next-line:no-var-requires
            pkg = require('./package.json');
            libraryName = 'terra';
            exports_1("default", {
                input: "src/index.ts",
                output: [
                    {
                        file: pkg.main,
                        name: lodash_camelcase_1.default(libraryName),
                        format: 'iife',
                        globals: {
                            three: 'THREE',
                        },
                        sourcemap: true,
                    },
                    {
                        file: pkg.module,
                        format: 'es',
                        globals: {
                            three: 'THREE',
                        },
                        sourcemap: true,
                    },
                ],
                // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
                external: ['three'],
                watch: {
                    include: 'src/**',
                },
                plugins: [
                    // Allow json resolution
                    rollup_plugin_json_1.default(),
                    // Compile TypeScript files
                    rollup_plugin_typescript2_1.default({ useTsconfigDeclarationDir: true }),
                    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
                    rollup_plugin_commonjs_1.default(),
                    // Allow node_modules resolution, so you can use 'external' to control
                    // which external modules to include in the bundle
                    // https://github.com/rollup/rollup-plugin-node-resolve#usage
                    rollup_plugin_node_resolve_1.default(),
                    // Resolve source maps to the original source
                    rollup_plugin_sourcemaps_1.default(),
                ],
            });
        }
    };
});
System.register("src/Math/Constants", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var EPSILON1, EPSILON2, EPSILON3, EPSILON4, EPSILON5, EPSILON6, EPSILON7, EPSILON8, EPSILON9, EPSILON0, EPSILON11, EPSILON12, EPSILON13, EPSILON14, EPSILON15, EPSILON16, EPSILON17, EPSILON18, EPSILON19, EPSILON20, GRAVITATIONALPARAMETER, TWO_PI, RADIANS_PER_DEGREE, DEGREES_PER_RADIAN;
    return {
        setters: [],
        execute: function () {
            exports_2("EPSILON1", EPSILON1 = 0.1);
            exports_2("EPSILON2", EPSILON2 = 0.01);
            exports_2("EPSILON3", EPSILON3 = 0.001);
            exports_2("EPSILON4", EPSILON4 = 0.0001);
            exports_2("EPSILON5", EPSILON5 = 0.00001);
            exports_2("EPSILON6", EPSILON6 = 0.000001);
            exports_2("EPSILON7", EPSILON7 = 0.0000001);
            exports_2("EPSILON8", EPSILON8 = 0.00000001);
            exports_2("EPSILON9", EPSILON9 = 0.000000001);
            exports_2("EPSILON0", EPSILON0 = 0.0000000001);
            exports_2("EPSILON11", EPSILON11 = 0.00000000001);
            exports_2("EPSILON12", EPSILON12 = 0.000000000001);
            exports_2("EPSILON13", EPSILON13 = 0.0000000000001);
            exports_2("EPSILON14", EPSILON14 = 0.00000000000001);
            exports_2("EPSILON15", EPSILON15 = 0.000000000000001);
            exports_2("EPSILON16", EPSILON16 = 0.0000000000000001);
            exports_2("EPSILON17", EPSILON17 = 0.00000000000000001);
            exports_2("EPSILON18", EPSILON18 = 0.000000000000000001);
            exports_2("EPSILON19", EPSILON19 = 0.0000000000000000001);
            exports_2("EPSILON20", EPSILON20 = 0.00000000000000000001);
            exports_2("GRAVITATIONALPARAMETER", GRAVITATIONALPARAMETER = 3.986004418e14);
            exports_2("TWO_PI", TWO_PI = 2.0 * Math.PI);
            exports_2("RADIANS_PER_DEGREE", RADIANS_PER_DEGREE = Math.PI / 180.0);
            exports_2("DEGREES_PER_RADIAN", DEGREES_PER_RADIAN = 180.0 / Math.PI);
        }
    };
});
System.register("src/Math/Ellipsoid", ["src/Math/Cartesian", "src/Math/Constants"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Cartesian_1, Constants_1, Ellipsoid;
    return {
        setters: [
            function (Cartesian_1_1) {
                Cartesian_1 = Cartesian_1_1;
            },
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            }
        ],
        execute: function () {
            Ellipsoid = /** @class */ (function () {
                function Ellipsoid(x, y, z) {
                    x = x || 0.0;
                    y = y || 0.0;
                    z = z || 0.0;
                    this._radii = new Cartesian_1.Cartesian(x, y, z);
                    this._radiiSquared = new Cartesian_1.Cartesian(x * x, y * y, z * z);
                    this._radiiToTheFourth = new Cartesian_1.Cartesian(x * x * x * x, y * y * y * y, z * z * z * z);
                    this._oneOverRadii = new Cartesian_1.Cartesian(x === 0.0 ? 0.0 : 1.0 / x, y === 0.0 ? 0.0 : 1.0 / y, z === 0.0 ? 0.0 : 1.0 / z);
                    this._oneOverRadiiSquared = new Cartesian_1.Cartesian(x === 0.0 ? 0.0 : 1.0 / (x * x), y === 0.0 ? 0.0 : 1.0 / (y * y), z === 0.0 ? 0.0 : 1.0 / (z * z));
                    this._minimumRadius = Math.min(x, y, z);
                    this._maximumRadius = Math.max(x, y, z);
                    this._centerToleranceSquared = Constants_1.EPSILON1;
                    if (this._radiiSquared.z !== 0) {
                        this._squaredXOverSquaredZ = this._radiiSquared.x / this._radiiSquared.z;
                    }
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
            exports_3("Ellipsoid", Ellipsoid);
        }
    };
});
System.register("src/Math/Cartesian", ["three"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var THREE, Cartesian, scratchN, scratchK, wgs84RadiiSquared;
    return {
        setters: [
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            Cartesian = /** @class */ (function (_super) {
                __extends(Cartesian, _super);
                function Cartesian(x, y, z) {
                    if (x === void 0) { x = 0; }
                    if (y === void 0) { y = 0; }
                    if (z === void 0) { z = 0; }
                    var _this = _super.call(this, x, y, z) || this;
                    _this.x = 0;
                    _this.y = 0;
                    _this.z = 0;
                    _this.addVectors = THREE.Vector3.prototype.addVectors;
                    _this.normalize = THREE.Vector3.prototype.normalize;
                    _this.length = THREE.Vector3.prototype.length;
                    _this.multiplyScalar = THREE.Vector3.prototype.multiplyScalar;
                    _this.multiplyVectors = THREE.Vector3.prototype.multiplyVectors;
                    _this.divideScalar = THREE.Vector3.prototype.divideScalar;
                    return _this;
                }
                Cartesian.midpoint = function (a, b, result) {
                    result.x = (a.x + b.x) / 2;
                    result.y = (a.y + b.y) / 2;
                    result.z = (a.z + b.z) / 2;
                    return result;
                };
                Cartesian.fromCartographic = function (longitude, latitude, height, ellipsoid, result) {
                    if (height === void 0) { height = 0; }
                    var radiiSquared = ellipsoid ? ellipsoid.radiiSquared : wgs84RadiiSquared;
                    var cosLatitude = Math.cos(latitude);
                    scratchN.x = cosLatitude * Math.cos(longitude);
                    scratchN.y = cosLatitude * Math.sin(longitude);
                    scratchN.z = Math.sin(latitude);
                    scratchN.normalize();
                    scratchK.multiplyVectors(radiiSquared, scratchN);
                    var gamma = Math.sqrt(scratchN.dot(scratchK));
                    scratchK.divideScalar(gamma);
                    scratchN.multiplyScalar(height);
                    if (!result) {
                        result = new Cartesian();
                    }
                    return result.addVectors(scratchK, scratchN);
                };
                ;
                Cartesian.prototype.crossVectors = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return (_a = THREE.Vector3.prototype.crossVectors).call.apply(_a, [this].concat(args));
                    var _a;
                };
                Cartesian.prototype.subVectors = function (a, b) {
                    this.x = a.x - b.x;
                    this.y = a.y - b.y;
                    this.z = a.z - b.z;
                    return this;
                };
                Cartesian.prototype.copy = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.z = other.z;
                    return this;
                };
                Object.defineProperty(Cartesian.prototype, "height", {
                    get: function () { return this.y; },
                    set: function (height) { this.y = height; },
                    enumerable: true,
                    configurable: true
                });
                Cartesian.ZERO = new Cartesian(0, 0, 0);
                return Cartesian;
            }(THREE.Vector3));
            exports_4("Cartesian", Cartesian);
            scratchN = new Cartesian();
            scratchK = new Cartesian();
            wgs84RadiiSquared = new Cartesian(6378137.0 * 6378137.0, 6378137.0 * 6378137.0, 6356752.3142451793 * 6356752.3142451793);
        }
    };
});
System.register("src/Math/scaleToGeodeticSurface", ["src/Math/Cartesian", "src/Math/Constants"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    function scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared, result) {
        var positionX = cartesian.x;
        var positionY = cartesian.y;
        var positionZ = cartesian.z;
        var oneOverRadiiX = oneOverRadii.x;
        var oneOverRadiiY = oneOverRadii.y;
        var oneOverRadiiZ = oneOverRadii.z;
        var x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
        var y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
        var z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;
        // Compute the squared ellipsoid norm.
        var squaredNorm = x2 + y2 + z2;
        var ratio = Math.sqrt(1.0 / squaredNorm);
        // As an initial approximation, assume that the radial intersection is the projection point.
        var intersection = scaleToGeodeticSurfaceIntersection.copy(cartesian).multiplyScalar(ratio);
        // If the position is near the center, the iteration will not converge.
        if (squaredNorm < centerToleranceSquared) {
            return !isFinite(ratio) ? undefined : result.copy(intersection);
        }
        var oneOverRadiiSquaredX = oneOverRadiiSquared.x;
        var oneOverRadiiSquaredY = oneOverRadiiSquared.y;
        var oneOverRadiiSquaredZ = oneOverRadiiSquared.z;
        // Use the gradient at the intersection point in place of the true unit normal.
        // The difference in magnitude will be absorbed in the multiplier.
        var gradient = scaleToGeodeticSurfaceGradient;
        gradient.x = intersection.x * oneOverRadiiSquaredX * 2.0;
        gradient.y = intersection.y * oneOverRadiiSquaredY * 2.0;
        gradient.z = intersection.z * oneOverRadiiSquaredZ * 2.0;
        // Compute the initial guess at the normal vector multiplier, lambda.
        var lambda = (1.0 - ratio) * cartesian.length() / (0.5 * gradient.length());
        var correction = 0.0;
        var func;
        var denominator;
        var xMultiplier;
        var yMultiplier;
        var zMultiplier;
        var xMultiplier2;
        var yMultiplier2;
        var zMultiplier2;
        var xMultiplier3;
        var yMultiplier3;
        var zMultiplier3;
        do {
            lambda -= correction;
            xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX);
            yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY);
            zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ);
            xMultiplier2 = xMultiplier * xMultiplier;
            yMultiplier2 = yMultiplier * yMultiplier;
            zMultiplier2 = zMultiplier * zMultiplier;
            xMultiplier3 = xMultiplier2 * xMultiplier;
            yMultiplier3 = yMultiplier2 * yMultiplier;
            zMultiplier3 = zMultiplier2 * zMultiplier;
            func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0;
            // "denominator" here refers to the use of this expression in the velocity and acceleration
            // computations in the sections to follow.
            denominator = x2 * xMultiplier3 * oneOverRadiiSquaredX + y2 * yMultiplier3 * oneOverRadiiSquaredY + z2 * zMultiplier3 * oneOverRadiiSquaredZ;
            var derivative = -2.0 * denominator;
            correction = func / derivative;
        } while (Math.abs(func) > Constants_2.EPSILON12);
        result = result || new Cartesian_2.Cartesian({
            x: positionX * xMultiplier,
            y: positionY * yMultiplier,
            z: positionZ * zMultiplier,
        });
        result.x = positionX * xMultiplier;
        result.y = positionY * yMultiplier;
        result.z = positionZ * zMultiplier;
        return result;
    }
    exports_5("scaleToGeodeticSurface", scaleToGeodeticSurface);
    var Cartesian_2, Constants_2, scaleToGeodeticSurfaceIntersection, scaleToGeodeticSurfaceGradient;
    return {
        setters: [
            function (Cartesian_2_1) {
                Cartesian_2 = Cartesian_2_1;
            },
            function (Constants_2_1) {
                Constants_2 = Constants_2_1;
            }
        ],
        execute: function () {
            scaleToGeodeticSurfaceIntersection = new Cartesian_2.Cartesian();
            scaleToGeodeticSurfaceGradient = new Cartesian_2.Cartesian();
        }
    };
});
System.register("src/Math/Utils", ["src/Math/Constants"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    function toRadians(degrees) {
        return degrees * Constants_3.RADIANS_PER_DEGREE;
    }
    exports_6("toRadians", toRadians);
    function toDegrees(radians) {
        return radians * Constants_3.DEGREES_PER_RADIAN;
    }
    exports_6("toDegrees", toDegrees);
    /**
     * Converts a longitude value, in radians, to the range [<code>-Math.PI</code>, <code>Math.PI</code>).
     *
     * @param {Number} angle The longitude value, in radians, to convert to the range [<code>-Math.PI</code>, <code>Math.PI</code>).
     * @returns {Number} The equivalent longitude value in the range [<code>-Math.PI</code>, <code>Math.PI</code>).
     *
     * @example
     * // Convert 270 degrees to -90 degrees longitude
     * var longitude = Cesium.Math.convertLongitudeRange(Cesium.Math.toRadians(270.0));
     */
    function convertLongitudeRange(angle) {
        var twoPi = Constants_3.TWO_PI;
        var simplified = angle - Math.floor(angle / twoPi) * twoPi;
        if (simplified < -Math.PI) {
            return simplified + twoPi;
        }
        if (simplified >= Math.PI) {
            return simplified - twoPi;
        }
        return simplified;
    }
    exports_6("convertLongitudeRange", convertLongitudeRange);
    function fog(distanceToCamera, density) {
        var scalar = distanceToCamera * density;
        return 1.0 - Math.exp(-(scalar * scalar));
    }
    exports_6("fog", fog);
    function sign(value) {
        value = +value;
        if (value === 0 || value !== value) {
            return value;
        }
        return value > 0 ? 1 : -1;
    }
    exports_6("sign", sign);
    var Constants_3;
    return {
        setters: [
            function (Constants_3_1) {
                Constants_3 = Constants_3_1;
            }
        ],
        execute: function () {
            ;
            ;
            ;
            ;
        }
    };
});
System.register("src/Math/Cartographic", ["src/Math/Cartesian", "src/Math/Constants", "src/Math/scaleToGeodeticSurface", "src/Math/Utils"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var Cartesian_3, Constants_4, scaleToGeodeticSurface_1, Utils_1, wgs84OneOverRadii, wgs84OneOverRadiiSquared, wgs84CenterToleranceSquared, cartesianToCartographicP, cartesianToCartographicN, cartesianToCartographicH, Cartographic;
    return {
        setters: [
            function (Cartesian_3_1) {
                Cartesian_3 = Cartesian_3_1;
            },
            function (Constants_4_1) {
                Constants_4 = Constants_4_1;
            },
            function (scaleToGeodeticSurface_1_1) {
                scaleToGeodeticSurface_1 = scaleToGeodeticSurface_1_1;
            },
            function (Utils_1_1) {
                Utils_1 = Utils_1_1;
            }
        ],
        execute: function () {
            wgs84OneOverRadii = new Cartesian_3.Cartesian(1.0 / 6378137.0, 1.0 / 6378137.0, 1.0 / 6356752.3142451793);
            wgs84OneOverRadiiSquared = new Cartesian_3.Cartesian(1.0 / (6378137.0 * 6378137.0), 1.0 / (6378137.0 * 6378137.0), 1.0 / (6356752.3142451793 * 6356752.3142451793));
            wgs84CenterToleranceSquared = Constants_4.EPSILON1;
            /**
             * Shared variables
             */
            cartesianToCartographicP = new Cartesian_3.Cartesian();
            cartesianToCartographicN = new Cartesian_3.Cartesian();
            cartesianToCartographicH = new Cartesian_3.Cartesian();
            Cartographic = /** @class */ (function () {
                function Cartographic(longitude, latitude, height) {
                    if (longitude === void 0) { longitude = 0; }
                    if (latitude === void 0) { latitude = 0; }
                    if (height === void 0) { height = 0; }
                    this.longitude = 0;
                    this.latitude = 0;
                    this.height = 0;
                    this.longitude = longitude;
                    this.latitude = latitude;
                    this.height = height;
                }
                Cartographic.fromCartesian = function (cartesian, ellipsoid, result) {
                    var oneOverRadii = ellipsoid ? ellipsoid.oneOverRadii : wgs84OneOverRadii;
                    var oneOverRadiiSquared = ellipsoid ? ellipsoid.oneOverRadiiSquared : wgs84OneOverRadiiSquared;
                    var centerToleranceSquared = ellipsoid ? ellipsoid._centerToleranceSquared : wgs84CenterToleranceSquared;
                    var p = scaleToGeodeticSurface_1.scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared, cartesianToCartographicP);
                    if (!p) {
                        return;
                    }
                    var n = cartesianToCartographicN.multiplyVectors(p, oneOverRadiiSquared);
                    n.normalize();
                    var h = cartesianToCartographicH.subVectors(cartesian, p);
                    var longitude = Math.atan2(n.y, n.x);
                    var latitude = Math.asin(n.z);
                    var height = Utils_1.sign(h.dot(cartesian)) * h.length();
                    if (result) {
                        return new Cartographic(longitude, latitude, height);
                    }
                    result.longitude = longitude;
                    result.latitude = latitude;
                    result.height = height;
                    return result;
                };
                Cartographic.toCartesian = function (cartographic, ellipsoid, result) {
                    return Cartesian_3.Cartesian.fromCartographic(cartographic.longitude, cartographic.latitude, cartographic.height, ellipsoid, result);
                };
                Cartographic.prototype.clone = function () {
                    return new Cartographic(this.longitude, this.latitude, this.height);
                };
                Cartographic.prototype.equals = function (v) {
                    return v.longitude === this.longitude && v.latitude === this.latitude && v.height === this.height;
                };
                Cartographic.prototype.equalsEpsilon = function (v, epsilon) {
                    return (this === v) ||
                        (v &&
                            (Math.abs(this.longitude - v.longitude) <= epsilon) &&
                            (Math.abs(this.latitude - v.latitude) <= epsilon) &&
                            (Math.abs(this.height - v.height) <= epsilon));
                };
                ;
                Cartographic.prototype.toString = function () {
                    return '(' + this.longitude + ', ' + this.latitude + ', ' + this.height + ')';
                };
                ;
                Cartographic.ZERO = Object.freeze(new Cartographic());
                return Cartographic;
            }());
            exports_7("Cartographic", Cartographic);
        }
    };
});
System.register("src/Core/MapSettings", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var MapSettings;
    return {
        setters: [],
        execute: function () {
            exports_8("MapSettings", MapSettings = {
                basePlaneDimension: 20037508.342789244 * 2,
                cameraDistance: 1200000,
                maxCameraDistance: 1200000 * 100,
                debug: true,
                optimize: true,
            });
        }
    };
});
System.register("src/Utility/SphericalMercator", ["src/Core/MapSettings", "src/Math/Ellipsoid"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var MapSettings_1, Ellipsoid_1, EPSLN, D2R, R2D, cache, System, SphericalMercator, sphericalMercator;
    return {
        setters: [
            function (MapSettings_1_1) {
                MapSettings_1 = MapSettings_1_1;
            },
            function (Ellipsoid_1_1) {
                Ellipsoid_1 = Ellipsoid_1_1;
            }
        ],
        execute: function () {
            EPSLN = 1.0e-10;
            D2R = Math.PI / 180;
            R2D = 180 / Math.PI;
            cache = {};
            (function (System) {
                System[System["WGS84"] = 0] = "WGS84";
                System[System["EPSG4326"] = 1] = "EPSG4326";
                System[System["EPSG3857"] = 2] = "EPSG3857";
            })(System || (System = {}));
            exports_9("System", System);
            SphericalMercator = /** @class */ (function () {
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
                    return Math.abs(Ellipsoid_1.Ellipsoid.WGS84.maximumRadius * 2 * Math.PI * Math.cos(latitude * Math.PI / 180) / this.size);
                };
                SphericalMercator.prototype.PixelToCartographic = function (px, cartographic) {
                    var g = (px.z + MapSettings_1.MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
                    cartographic.longitude = Math.min((px.x + MapSettings_1.MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0], 180 - EPSLN);
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
                    px.x = x - MapSettings_1.MapSettings.basePlaneDimension / 2;
                    px.y = coordinate.altitude / this.mPerPixel(0);
                    px.z = y - MapSettings_1.MapSettings.basePlaneDimension / 2;
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
                    cartesian.x = x - MapSettings_1.MapSettings.basePlaneDimension / 2;
                    cartesian.y = cartographic.altitude / this.mPerPixel(0);
                    cartesian.z = y - MapSettings_1.MapSettings.basePlaneDimension / 2;
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
                    cartesian.x = x - MapSettings_1.MapSettings.basePlaneDimension / 2;
                    cartesian.y = cartographic.altitude / this.mPerPixel(0);
                    cartesian.z = y - MapSettings_1.MapSettings.basePlaneDimension / 2;
                    return cartesian;
                };
                SphericalMercator.prototype.CartesianToCartographic = function (cartesian, cartographic) {
                    var g = (cartesian.z + MapSettings_1.MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
                    cartographic.longitude = Math.min((cartesian.x + MapSettings_1.MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0], 180 - EPSLN);
                    cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
                    var meterPerPixel = this.mPerPixel(cartographic.latitude);
                    cartographic.altitude = cartesian.y * meterPerPixel;
                };
                SphericalMercator.prototype.CartographicToEPSG4326 = function (cartographic, cartesian) {
                    cartesian.x = cartographic.longitude / 90 * Ellipsoid_1.Ellipsoid.WGS84.maximumRadius;
                    cartesian.y = cartographic.altitude;
                    cartesian.z = cartographic.latitude / 90 * Ellipsoid_1.Ellipsoid.WGS84.maximumRadius;
                };
                return SphericalMercator;
            }());
            exports_9("SphericalMercator", SphericalMercator);
            exports_9("sphericalMercator", sphericalMercator = new SphericalMercator({ size: MapSettings_1.MapSettings.basePlaneDimension }));
        }
    };
});
System.register("src/Renderer/Camera", ["three", "src/Math/Cartesian", "src/Utility/SphericalMercator"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var THREE, Cartesian_4, SphericalMercator_1, t, s, corner, Camera;
    return {
        setters: [
            function (THREE_2) {
                THREE = THREE_2;
            },
            function (Cartesian_4_1) {
                Cartesian_4 = Cartesian_4_1;
            },
            function (SphericalMercator_1_1) {
                SphericalMercator_1 = SphericalMercator_1_1;
            }
        ],
        execute: function () {
            t = new Cartesian_4.Cartesian();
            s = new THREE.Vector3();
            corner = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
            Camera = /** @class */ (function (_super) {
                __extends(Camera, _super);
                // FIXME: Debug
                // geometry: THREE.Geometry;
                function Camera(options) {
                    var _this = _super.call(this, 70, options.canvas.width / options.canvas.height, 1 / 99, 12000000 / Math.sin(70 * Math.PI)) || this;
                    _this.target = new Cartesian_4.Cartesian();
                    _this._targetCartographic = QtPositioning.coordinate();
                    _this._positionCartographic = QtPositioning.coordinate();
                    _this._map = options.map;
                    _this._targetCartographic = QtPositioning.coordinate();
                    _this._positionCartographic = QtPositioning.coordinate();
                    _this._culledGroundPlane = [new Cartesian_4.Cartesian(), new Cartesian_4.Cartesian(), new Cartesian_4.Cartesian(), new Cartesian_4.Cartesian()];
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
                    SphericalMercator_1.sphericalMercator.PixelToCartographic(this.position, this._positionCartographic);
                    this.updatedLastFrame = true;
                };
                Camera.prototype.update = function () {
                    // Update Cartographic position
                    SphericalMercator_1.sphericalMercator.CartesianToCartographic(this.target, this._targetCartographic);
                    t.addVectors(this.target, this.position);
                    SphericalMercator_1.sphericalMercator.CartesianToCartographic(t, this._positionCartographic);
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
            exports_10("Camera", Camera);
        }
    };
});
System.register("src/Utility/MapUtility", ["three", "src/Utility/SphericalMercator"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var THREE, SphericalMercator_2, screenPosition, MapUtility;
    return {
        setters: [
            function (THREE_3) {
                THREE = THREE_3;
            },
            function (SphericalMercator_2_1) {
                SphericalMercator_2 = SphericalMercator_2_1;
            }
        ],
        execute: function () {
            screenPosition = new THREE.Vector2();
            MapUtility = /** @class */ (function () {
                function MapUtility() {
                }
                MapUtility.ground = function (position) {
                    var _ = position.clone();
                    // FIXME: ground = 0 by now
                    _.y = 0;
                    return _;
                };
                MapUtility.tenMeters = function (latitude) {
                    return 10 / (latitude ? SphericalMercator_2.sphericalMercator.mPerPixel(latitude) : SphericalMercator_2.sphericalMercator.meterPerPixel);
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
            exports_11("MapUtility", MapUtility);
        }
    };
});
System.register("src/Renderer/OrbitConstraint", ["three", "src/Core/MapSettings"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var THREE, MapSettings_2, zero, quat, quatInverse, EPS, v, OrbitConstraint;
    return {
        setters: [
            function (THREE_4) {
                THREE = THREE_4;
            },
            function (MapSettings_2_1) {
                MapSettings_2 = MapSettings_2_1;
            }
        ],
        execute: function () {
            zero = new THREE.Vector3();
            // so camera.up is the orbit axis
            quat = new THREE.Quaternion();
            quatInverse = new THREE.Quaternion();
            EPS = 0.000001;
            v = new THREE.Vector3();
            OrbitConstraint = /** @class */ (function () {
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
                    this.maxDistance = MapSettings_2.MapSettings.maxCameraDistance;
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
            exports_12("OrbitConstraint", OrbitConstraint);
        }
    };
});
System.register("src/Renderer/OrbitControls", ["three", "src/Core/MapSettings", "src/Utility/MapUtility", "src/Utility/SphericalMercator", "src/Renderer/OrbitConstraint"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
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
    function pickerFromScreen(primitive, x, y, p) {
        screenPosition.set((x / primitive.canvas.width) * 2 - 1, -(y / primitive.canvas.height) * 2 + 1);
        p.setFromCamera(screenPosition, primitive.camera);
        return p;
    }
    function contextmenu(event) {
        event.preventDefault();
    }
    var THREE, MapSettings_3, MapUtility_1, SphericalMercator_3, OrbitConstraint_1, screenPosition, picker, px, OrbitControls;
    return {
        setters: [
            function (THREE_5) {
                THREE = THREE_5;
            },
            function (MapSettings_3_1) {
                MapSettings_3 = MapSettings_3_1;
            },
            function (MapUtility_1_1) {
                MapUtility_1 = MapUtility_1_1;
            },
            function (SphericalMercator_3_1) {
                SphericalMercator_3 = SphericalMercator_3_1;
            },
            function (OrbitConstraint_1_1) {
                OrbitConstraint_1 = OrbitConstraint_1_1;
            }
        ],
        execute: function () {
            screenPosition = new THREE.Vector2();
            picker = new THREE.Raycaster();
            px = new THREE.Vector3();
            OrbitControls = /** @class */ (function (_super) {
                __extends(OrbitControls, _super);
                function OrbitControls(options) {
                    var _this = _super.call(this) || this;
                    _this._map = options.map;
                    _this.constraint = new OrbitConstraint_1.OrbitConstraint(_this._map, _this._map.camera, MapSettings_3.MapSettings.cameraDistance);
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
                    var currentPin = null;
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
                            MapUtility_1.MapUtility.rayCasterFromScreen(scope, x, y, picker);
                            var intersects = picker.intersectObjects(scope._map.currentMission.interactableObjects(), true);
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
                            case 1:// one-fingered touch: rotate
                                if (scope.enableRotate === false) {
                                    return;
                                }
                                scope._state = OrbitControls.STATE.TOUCH_ROTATE;
                                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                                break;
                            case 2:// two-fingered touch: dolly
                                if (scope.enableZoom === false) {
                                    return;
                                }
                                scope._state = OrbitControls.STATE.TOUCH_DOLLY;
                                var dx = event.touches[0].pageX - event.touches[1].pageX;
                                var dy = event.touches[0].pageY - event.touches[1].pageY;
                                var distance = Math.sqrt(dx * dx + dy * dy);
                                dollyStart.set(0, distance);
                                break;
                            case 3:// three-fingered touch: pan
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
                            case 1:// one-fingered touch: rotate
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
                            case 2:// two-fingered touch: dolly
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
                            case 3:// three-fingered touch: pan
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
                    SphericalMercator_3.sphericalMercator.CartographicToPixel(position, px);
                    // FIXME: Y = elevation data
                    this.constraint.camera.target.set(px.x, 0, px.z);
                    this.constraint.targetDistance = Math.pow(0.5, zoom) * MapSettings_3.MapSettings.cameraDistance;
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
            exports_13("OrbitControls", OrbitControls);
        }
    };
});
System.register("src/Object/RenderingObject", [], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var RenderingObject;
    return {
        setters: [],
        execute: function () {
            RenderingObject = /** @class */ (function () {
                function RenderingObject() {
                }
                return RenderingObject;
            }());
            exports_14("RenderingObject", RenderingObject);
        }
    };
});
System.register("src/Object/Pin", ["three", "src/Math/Cartesian", "src/Math/Cartographic", "src/Utility/MapUtility", "src/Utility/SphericalMercator", "src/Object/RenderingObject"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var THREE, Cartesian_5, Cartographic_1, MapUtility_2, SphericalMercator_4, RenderingObject_1, Pin;
    return {
        setters: [
            function (THREE_6) {
                THREE = THREE_6;
            },
            function (Cartesian_5_1) {
                Cartesian_5 = Cartesian_5_1;
            },
            function (Cartographic_1_1) {
                Cartographic_1 = Cartographic_1_1;
            },
            function (MapUtility_2_1) {
                MapUtility_2 = MapUtility_2_1;
            },
            function (SphericalMercator_4_1) {
                SphericalMercator_4 = SphericalMercator_4_1;
            },
            function (RenderingObject_1_1) {
                RenderingObject_1 = RenderingObject_1_1;
            }
        ],
        execute: function () {
            Pin = /** @class */ (function (_super) {
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
                    _this._position = new Cartesian_5.Cartesian();
                    _this._coordinate = new Cartographic_1.Cartographic();
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
                            this._position.y = MapUtility_2.MapUtility.tenMeters();
                        }
                        else {
                            // Case position is a QtPositioning.coordiante
                            if (p.longitude) {
                                SphericalMercator_4.sphericalMercator.CartographicToCartesian(p, this._position);
                            }
                            else {
                                this._position.copy(p);
                                // Default height is 10 meters
                                this._position.y = this._position.y || MapUtility_2.MapUtility.tenMeters();
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
                            SphericalMercator_4.sphericalMercator.CartographicToCartesian(p, this._position);
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
                    SphericalMercator_4.sphericalMercator.CartesianToCartographic(this._position, this._coordinate);
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
            }(RenderingObject_1.RenderingObject));
            exports_15("Pin", Pin);
        }
    };
});
System.register("src/Object/Mission", ["src/Object/RenderingObject"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var RenderingObject_2, Mission;
    return {
        setters: [
            function (RenderingObject_2_1) {
                RenderingObject_2 = RenderingObject_2_1;
            }
        ],
        execute: function () {
            Mission = /** @class */ (function (_super) {
                __extends(Mission, _super);
                function Mission(options) {
                    var _this = _super.call(this) || this;
                    _this._map = options.map;
                    return _this;
                }
                return Mission;
            }(RenderingObject_2.RenderingObject));
            exports_16("Mission", Mission);
        }
    };
});
System.register("src/Object/Polygon", ["three", "src/Core/MapSettings", "src/Utility/MapUtility", "src/Utility/SphericalMercator", "src/Object/Mission", "src/Object/Pin"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    var THREE, MapSettings_4, MapUtility_3, SphericalMercator_5, Mission_1, Pin_1, panStart, picker, panEnd, panDelta, px, Polygon;
    return {
        setters: [
            function (THREE_7) {
                THREE = THREE_7;
            },
            function (MapSettings_4_1) {
                MapSettings_4 = MapSettings_4_1;
            },
            function (MapUtility_3_1) {
                MapUtility_3 = MapUtility_3_1;
            },
            function (SphericalMercator_5_1) {
                SphericalMercator_5 = SphericalMercator_5_1;
            },
            function (Mission_1_1) {
                Mission_1 = Mission_1_1;
            },
            function (Pin_1_1) {
                Pin_1 = Pin_1_1;
            }
        ],
        execute: function () {
            panStart = new THREE.Vector2();
            picker = new THREE.Raycaster();
            panEnd = new THREE.Vector2();
            panDelta = new THREE.Vector2();
            px = new THREE.Vector3();
            Polygon = /** @class */ (function (_super) {
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
                    var pin = new Pin_1.Pin({
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
                    if (MapSettings_4.MapSettings.debug) {
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
                        MapUtility_3.MapUtility.rayCasterFromScreen(controls, x, y, picker);
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
                    MapUtility_3.MapUtility.rayCasterFromScreen(controls, x, y, picker);
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
                        MapUtility_3.MapUtility.rayCasterFromScreen(controls, x, y, picker);
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
                            SphericalMercator_5.sphericalMercator.CartographicToPixel(grid[i], px);
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
            }(Mission_1.Mission));
            exports_17("Polygon", Polygon);
        }
    };
});
System.register("src/Object/Polyline", ["three", "src/Core/MapSettings", "src/Utility/MapUtility", "src/Object/Mission", "src/Object/Pin"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var THREE, MapSettings_5, MapUtility_4, Mission_2, Pin_2, panStart, picker, panEnd, panDelta, px, Polyline;
    return {
        setters: [
            function (THREE_8) {
                THREE = THREE_8;
            },
            function (MapSettings_5_1) {
                MapSettings_5 = MapSettings_5_1;
            },
            function (MapUtility_4_1) {
                MapUtility_4 = MapUtility_4_1;
            },
            function (Mission_2_1) {
                Mission_2 = Mission_2_1;
            },
            function (Pin_2_1) {
                Pin_2 = Pin_2_1;
            }
        ],
        execute: function () {
            panStart = new THREE.Vector2();
            picker = new THREE.Raycaster();
            panEnd = new THREE.Vector2();
            panDelta = new THREE.Vector2();
            px = new THREE.Vector3();
            Polyline = /** @class */ (function (_super) {
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
                    var pin = new Pin_2.Pin({
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
                        this._map.renderScene.add(line);
                    }
                    if (MapSettings_5.MapSettings.debug) {
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
                        this._map.renderScene.remove(line);
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
                    panStart.set(x, y);
                    // Doubled click => Create new PIN
                    if (controls._lastClick && now - controls._lastClick < controls.constraint.maxClickTimeInterval &&
                        this.enableMoveMarker === true) {
                        MapUtility_4.MapUtility.rayCasterFromScreen(controls, x, y, picker);
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
                        controls._state = Polyline.STATE.CHANGE_PIN_HEIGHT;
                        controls._lastClick = null;
                        return true;
                    }
                    MapUtility_4.MapUtility.rayCasterFromScreen(controls, x, y, picker);
                    intersects = picker.intersectObjects(this.interactableObjects());
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
                        panEnd.set(x, y);
                        panDelta.subVectors(panEnd, panStart);
                        this.activePin.height += -panDelta.y * controls.camera.position.y / controls.canvas.height;
                        panStart.copy(panEnd);
                        return true;
                    }
                    else if (controls._state === Polyline.STATE.CHANGE_PIN_POSITION) {
                        if (!this.enableMoveMarker) {
                            return false;
                        }
                        MapUtility_4.MapUtility.rayCasterFromScreen(controls, x, y, picker);
                        // TODO: Deprecated base plane
                        var markerPosition = picker.intersectObjects(this._map.quadTree.tiles.children)[0].point;
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
            }(Mission_2.Mission));
            exports_18("Polyline", Polyline);
        }
    };
});
System.register("src/Object/Skybox", ["three", "src/Core/MapSettings"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var THREE, MapSettings_6, three_1, Skybox;
    return {
        setters: [
            function (THREE_9) {
                THREE = THREE_9;
                three_1 = THREE_9;
            },
            function (MapSettings_6_1) {
                MapSettings_6 = MapSettings_6_1;
            }
        ],
        execute: function () {
            Skybox = /** @class */ (function (_super) {
                __extends(Skybox, _super);
                function Skybox() {
                    var _this = this;
                    var skyboxTexture = new THREE.CubeTexture([]);
                    skyboxTexture.format = THREE.RGBFormat;
                    // const loader = new THREE.ImageLoader();
                    var textures = [
                        new three_1.TextureLoader().load('../skybox/skybox_nx.jpg'),
                        new three_1.TextureLoader().load('../skybox/skybox_ny.jpg'),
                        new three_1.TextureLoader().load('../skybox/skybox_nz.jpg'),
                        new three_1.TextureLoader().load('../skybox/skybox_px.jpg'),
                        new three_1.TextureLoader().load('../skybox/skybox_py.jpg'),
                        new three_1.TextureLoader().load('../skybox/skybox_pz.jpg'),
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
                    _this = _super.call(this, new THREE.CubeGeometry(MapSettings_6.MapSettings.basePlaneDimension, MapSettings_6.MapSettings.basePlaneDimension, MapSettings_6.MapSettings.basePlaneDimension, 1, 1, 1), skyMaterial) || this;
                    _this.position.y = MapSettings_6.MapSettings.basePlaneDimension / 2 - 100;
                    return _this;
                }
                return Skybox;
            }(THREE.Mesh));
            exports_19("Skybox", Skybox);
        }
    };
});
System.register("src/Object/Vehicle", ["three", "src/Utility/MapUtility", "src/Utility/SphericalMercator", "src/Object/RenderingObject"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var THREE, MapUtility_5, SphericalMercator_6, RenderingObject_3, Vehicle;
    return {
        setters: [
            function (THREE_10) {
                THREE = THREE_10;
            },
            function (MapUtility_5_1) {
                MapUtility_5 = MapUtility_5_1;
            },
            function (SphericalMercator_6_1) {
                SphericalMercator_6 = SphericalMercator_6_1;
            },
            function (RenderingObject_3_1) {
                RenderingObject_3 = RenderingObject_3_1;
            }
        ],
        execute: function () {
            Vehicle = /** @class */ (function (_super) {
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
                    options.map.renderScene.add(_this.group);
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
                    this._map.renderScene.remove(this.group);
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
                            this._position.y = MapUtility_5.MapUtility.tenMeters();
                        }
                        else {
                            // Case position is a QtPositioning.coordiante
                            if (p.longitude) {
                                SphericalMercator_6.sphericalMercator.CartographicToPixel(p, this._position);
                            }
                            else {
                                this._position.copy(p);
                                // Default height is 10 meters
                                this._position.y = this._position.y || MapUtility_5.MapUtility.tenMeters();
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
                    SphericalMercator_6.sphericalMercator.PixelToCartographic(this._position, this._coordinate);
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
            }(RenderingObject_3.RenderingObject));
            exports_20("Vehicle", Vehicle);
        }
    };
});
System.register("src/DataSource/DataSourceLayer", [], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var DataSourceLayer;
    return {
        setters: [],
        execute: function () {
            DataSourceLayer = /** @class */ (function () {
                function DataSourceLayer() {
                }
                DataSourceLayer.layerName = 'none';
                return DataSourceLayer;
            }());
            exports_21("DataSourceLayer", DataSourceLayer);
        }
    };
});
System.register("src/DataSource/DataSource", [], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var DataSource;
    return {
        setters: [],
        execute: function () {
            DataSource = /** @class */ (function () {
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
            exports_22("DataSource", DataSource);
        }
    };
});
System.register("src/Math/Plane", ["three"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var THREE, Plane;
    return {
        setters: [
            function (THREE_11) {
                THREE = THREE_11;
            }
        ],
        execute: function () {
            Plane = /** @class */ (function (_super) {
                __extends(Plane, _super);
                function Plane() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return Plane;
            }(THREE.Plane));
            exports_23("Plane", Plane);
        }
    };
});
System.register("src/Math/AABB", ["three", "src/Math/Cartesian"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    var THREE, Cartesian_6, cameraCartesianPosition, AABB;
    return {
        setters: [
            function (THREE_12) {
                THREE = THREE_12;
            },
            function (Cartesian_6_1) {
                Cartesian_6 = Cartesian_6_1;
            }
        ],
        execute: function () {
            cameraCartesianPosition = new Cartesian_6.Cartesian();
            AABB = /** @class */ (function (_super) {
                __extends(AABB, _super);
                function AABB(min, max) {
                    var _this = _super.call(this, min, max) || this;
                    _this.center = new Cartesian_6.Cartesian();
                    _this.center.addVectors(_this.min, _this.max).divideScalar(2);
                    return _this;
                }
                AABB.prototype.distanceToCamera = function (camera) {
                    cameraCartesianPosition.set(camera.position.x + camera.target.x, camera.position.y + camera.target.y, camera.position.z + camera.target.z);
                    return this.distanceToPoint(cameraCartesianPosition);
                };
                return AABB;
            }(THREE.Box3));
            exports_24("AABB", AABB);
        }
    };
});
System.register("src/SceneMode/Tile", ["src/Core/MapSettings"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    var MapSettings_7, size, Tile;
    return {
        setters: [
            function (MapSettings_7_1) {
                MapSettings_7 = MapSettings_7_1;
            }
        ],
        execute: function () {
            size = Array.apply(null, Array(32)).map(function (_, idx) {
                return MapSettings_7.MapSettings.basePlaneDimension / Math.pow(2, idx);
            });
            Tile = /** @class */ (function () {
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
            exports_25("Tile", Tile);
        }
    };
});
System.register("src/Core/Pool", [], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    var Pool;
    return {
        setters: [],
        execute: function () {
            Pool = /** @class */ (function () {
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
            exports_26("Pool", Pool);
        }
    };
});
System.register("src/Core/TileReplacementQueue", [], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
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
    var TileReplacementQueue;
    return {
        setters: [],
        execute: function () {
            TileReplacementQueue = /** @class */ (function () {
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
            exports_27("TileReplacementQueue", TileReplacementQueue);
        }
    };
});
System.register("src/Core/QuadTree", ["three", "src/Core/Pool", "src/Core/TileReplacementQueue"], function (exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    var THREE, Pool_1, TileReplacementQueue_1, QuadTree;
    return {
        setters: [
            function (THREE_13) {
                THREE = THREE_13;
            },
            function (Pool_1_1) {
                Pool_1 = Pool_1_1;
            },
            function (TileReplacementQueue_1_1) {
                TileReplacementQueue_1 = TileReplacementQueue_1_1;
            }
        ],
        execute: function () {
            QuadTree = /** @class */ (function () {
                function QuadTree(options) {
                    this.scene = options.map.scene;
                    this.tiles = new THREE.Group();
                    this.tiles.name = 'Tiles';
                    this.scene.add(this.tiles);
                    this.camera = options.map.camera;
                    this._rootTile = options.mode.createRootTile(this);
                    this.mode = options.mode;
                    this._activeTiles = [];
                    this._tileLoadQueueHigh = []; // high priority tiles are preventing refinement
                    this._tileLoadQueueMedium = []; // medium priority tiles are being rendered
                    this._tileLoadQueueLow = []; // low priority tiles were refined past or are non-visible parts of quads.
                    this._tileReplacementQueue = new TileReplacementQueue_1.TileReplacementQueue();
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
                    this._pool = new Pool_1.Pool({
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
                    this.clearTileLoadQueue();
                    this._tileReplacementQueue.markStartOfRenderFrame();
                    this.selectTilesForRendering();
                    this.renderTiles(this._activeTiles);
                    this.processTileLoadQueue();
                    this.updateTileLoadProgress();
                    this.camera.updatedLastFrame = false;
                };
                QuadTree.prototype.clearTileLoadQueue = function () {
                    var debug = this._debug;
                    debug.maxDepth = 0;
                    debug.tilesVisited = 0;
                    debug.tilesCulled = 0;
                    debug.tilesRendered = 0;
                    debug.tilesWaitingForChildren = 0;
                    this._tileLoadQueueHigh.length = 0;
                    this._tileLoadQueueMedium.length = 0;
                    this._tileLoadQueueLow.length = 0;
                };
                QuadTree.prototype.selectTilesForRendering = function () {
                    var debug = this._debug;
                    // Clear the render list.
                    var tilesToRender = this._activeTiles;
                    tilesToRender.length = 0;
                    // We can't render anything before the level zero tiles exist.
                    // var tileProvider = primitive._tileProvider;
                    var tile;
                    var rootTiles = this._rootTile;
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
                        this._tileReplacementQueue.markTileRendered(tile);
                        if (!tile.renderable) {
                            if (tile.needsLoading) {
                                this._tileLoadQueueHigh.push(tile);
                            }
                            ++debug.tilesWaitingForChildren;
                        }
                        else if (this.computeTileVisibility(tile)) {
                            this.visitTile(tile);
                        }
                        else {
                            if (tile.needsLoading) {
                                this._tileLoadQueueLow.push(tile);
                            }
                            ++debug.tilesCulled;
                        }
                    }
                };
                QuadTree.prototype.visitTile = function (tile) {
                    var debug = this._debug;
                    ++debug.tilesVisited;
                    this._tileReplacementQueue.markTileRendered(tile);
                    if (tile.z > debug.maxDepth) {
                        debug.maxDepth = tile.z;
                    }
                    if (this.mode.screenSpaceError(this, tile) < this.maximumScreenSpaceError) {
                        // This tile meets SSE requirements, so render it.
                        if (tile.needsLoading) {
                            // Rendered tile meeting SSE loads with medium priority.
                            this._tileLoadQueueMedium.push(tile);
                        }
                        this.addTileToRenderList(tile);
                        return;
                    }
                    var allAreRenderable = tile.children[0].renderable && tile.children[1].renderable
                        && tile.children[2].renderable && tile.children[3].renderable;
                    var allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent &&
                        tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;
                    if (allAreRenderable) {
                        if (allAreUpsampled) {
                            // No point in rendering the children because they're all upsampled.  Render this tile instead.
                            this.addTileToRenderList(tile);
                            // Load the children even though we're (currently) not going to render them.
                            // A tile that is "upsampled only" right now might change its tune once it does more loading.
                            // A tile that is upsampled now and forever should also be done loading, so no harm done.
                            this.queueChildLoadNearToFar(this.camera.target, tile.children);
                            if (tile.needsLoading) {
                                // Rendered tile that's not waiting on children loads with medium priority.
                                this._tileLoadQueueMedium.push(tile);
                            }
                        }
                        else {
                            // SSE is not good enough and children are loaded, so refine.
                            // No need to add the children to the load queue because
                            // they'll be added (if necessary) when they're visited.
                            this.visitVisibleChildrenNearToFar(tile.children);
                            if (tile.needsLoading) {
                                // Tile is not rendered, so load it with low priority.
                                this._tileLoadQueueLow.push(tile);
                            }
                        }
                    }
                    else {
                        // We'd like to refine but can't because not all of our children are
                        // renderable.  Load the refinement blockers with high priority and
                        // render this tile in the meantime.
                        this.queueChildLoadNearToFar(this.camera.target, tile.children);
                        this.addTileToRenderList(tile);
                        if (tile.needsLoading) {
                            // We will refine this tile when it's possible, so load this tile only with low priority.
                            this._tileLoadQueueLow.push(tile);
                        }
                    }
                };
                QuadTree.prototype.queueChildLoadNearToFar = function (cameraPosition, children) {
                    if (cameraPosition.x < children[0].bbox.max.x) {
                        if (cameraPosition.z < children[0].bbox.max.z) {
                            // Camera in northwest quadrant
                            this.queueChildTileLoad(children[0]);
                            this.queueChildTileLoad(children[2]);
                            this.queueChildTileLoad(children[1]);
                            this.queueChildTileLoad(children[3]);
                        }
                        else {
                            // Camera in southwest quadrant
                            this.queueChildTileLoad(children[2]);
                            this.queueChildTileLoad(children[0]);
                            this.queueChildTileLoad(children[3]);
                            this.queueChildTileLoad(children[1]);
                        }
                    }
                    else if (cameraPosition.z < children[0].bbox.max.z) {
                        // Camera northeast quadrant
                        this.queueChildTileLoad(children[1]);
                        this.queueChildTileLoad(children[3]);
                        this.queueChildTileLoad(children[0]);
                        this.queueChildTileLoad(children[2]);
                    }
                    else {
                        // Camera in northeast quadrant
                        this.queueChildTileLoad(children[3]);
                        this.queueChildTileLoad(children[1]);
                        this.queueChildTileLoad(children[2]);
                        this.queueChildTileLoad(children[0]);
                    }
                };
                QuadTree.prototype.queueChildTileLoad = function (childTile) {
                    // Tile is deeper than max stop
                    if (childTile.z > this.maxDepth) {
                        return;
                    }
                    this._tileReplacementQueue.markTileRendered(childTile);
                    if (childTile.needsLoading) {
                        if (childTile.renderable) {
                            this._tileLoadQueueLow.push(childTile);
                        }
                        else {
                            // A tile blocking refine loads with high priority
                            this._tileLoadQueueHigh.push(childTile);
                        }
                    }
                };
                QuadTree.prototype.visitVisibleChildrenNearToFar = function (children) {
                    var _this = this;
                    var distances = children.map(function (child) {
                        return { tile: child, distance: child.bbox.distanceToPoint(_this.camera.target) };
                    });
                    distances.sort(function (a, b) {
                        return a.distance - b.distance;
                    });
                    distances.forEach(function (_a) {
                        var tile = _a.tile;
                        return _this.visitIfVisible(tile);
                    });
                };
                QuadTree.prototype.computeTileVisibility = function (tile) {
                    var camera = this.camera;
                    var matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                    var frustum = new THREE.Frustum().setFromMatrix(matrix);
                    // TODO: using AABB to Culling
                    return frustum.intersectsBox(tile.bbox);
                };
                QuadTree.prototype.visitIfVisible = function (tile) {
                    if (this.computeTileVisibility(tile)) {
                        this.visitTile(tile);
                    }
                    else {
                        ++this._debug.tilesCulled;
                        this._tileReplacementQueue.markTileRendered(tile);
                        // We've decided this tile is not visible, but if it's not fully loaded yet, we've made
                        // this determination based on possibly-incorrect information.  We need to load this
                        // culled tile with low priority just in case it turns out to be visible after all.
                        if (tile.needsLoading) {
                            this._tileLoadQueueLow.push(tile);
                        }
                    }
                };
                QuadTree.prototype.addTileToRenderList = function (tile) {
                    this._activeTiles.push(tile);
                    ++this._debug.tilesRendered;
                };
                QuadTree.prototype.renderTiles = function (tiles) {
                    var _this = this;
                    if (tiles.length === 0) {
                        return;
                    }
                    var pool = this._pool;
                    while (tiles.length > pool.length) {
                        pool.duplicate();
                    }
                    this.tiles.children.length = 0;
                    var target = this.camera.target;
                    tiles.forEach(function (tile) {
                        // Recalculate tile position
                        var center = tile.bbox.center;
                        var mesh = tile.mesh;
                        mesh.position.set(center.x - target.x, center.y - target.y, center.z - target.z);
                        tile.applyDataToMesh(mesh);
                        _this.tiles.add(mesh);
                    });
                };
                QuadTree.prototype.processTileLoadQueue = function () {
                    var tileLoadQueueHigh = this._tileLoadQueueHigh;
                    var tileLoadQueueMedium = this._tileLoadQueueMedium;
                    var tileLoadQueueLow = this._tileLoadQueueLow;
                    if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
                        return;
                    }
                    // Remove any tiles that were not used this frame beyond the number
                    // we're allowed to keep.
                    this._tileReplacementQueue.trimTiles(this.tileCacheSize);
                    var endTime = Date.now() + this._loadQueueTimeSlice;
                    this.processSinglePriorityLoadQueue(endTime, tileLoadQueueHigh);
                    this.processSinglePriorityLoadQueue(endTime, tileLoadQueueMedium);
                    this.processSinglePriorityLoadQueue(endTime, tileLoadQueueLow);
                };
                QuadTree.prototype.processSinglePriorityLoadQueue = function (endTime, loadQueue) {
                    var _loop_1 = function (i, len) {
                        var tile = loadQueue[i];
                        this_1._tileReplacementQueue.markTileRendered(tile);
                        this_1.mode.providers.forEach(function (provider) { return provider.loadTile(tile); });
                    };
                    var this_1 = this;
                    for (var i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
                        _loop_1(i, len);
                    }
                };
                QuadTree.prototype.updateTileLoadProgress = function () {
                    var currentLoadQueueLength = this._tileLoadQueueHigh.length +
                        this._tileLoadQueueMedium.length +
                        this._tileLoadQueueLow.length;
                    if (currentLoadQueueLength !== this._lastTileLoadQueueLength) {
                        this._lastTileLoadQueueLength = currentLoadQueueLength;
                    }
                    var debug = this._debug;
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
                };
                return QuadTree;
            }());
            exports_28("QuadTree", QuadTree);
        }
    };
});
System.register("src/Core/TilingScheme", ["src/Math/Ellipsoid"], function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    var Ellipsoid_2, TilingScheme;
    return {
        setters: [
            function (Ellipsoid_2_1) {
                Ellipsoid_2 = Ellipsoid_2_1;
            }
        ],
        execute: function () {
            TilingScheme = /** @class */ (function () {
                function TilingScheme(options) {
                    this._ellipsoid = new Ellipsoid_2.Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);
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
            exports_29("TilingScheme", TilingScheme);
        }
    };
});
System.register("src/DataSource/Provider", [], function (exports_30, context_30) {
    "use strict";
    var __moduleName = context_30 && context_30.id;
    var Provider;
    return {
        setters: [],
        execute: function () {
            Provider = /** @class */ (function () {
                function Provider(options) {
                    options = options || {};
                    this._maxLoad = options.maxLoad || 50;
                    this._loading = 0;
                }
                return Provider;
            }());
            exports_30("Provider", Provider);
        }
    };
});
System.register("src/SceneMode/SceneMode", ["src/Math/AABB", "src/Math/Cartesian", "src/Utility/SphericalMercator"], function (exports_31, context_31) {
    "use strict";
    var __moduleName = context_31 && context_31.id;
    var AABB_1, Cartesian_7, SphericalMercator_7, topLeftCorner, bottomRightCorner, SceneMode;
    return {
        setters: [
            function (AABB_1_1) {
                AABB_1 = AABB_1_1;
            },
            function (Cartesian_7_1) {
                Cartesian_7 = Cartesian_7_1;
            },
            function (SphericalMercator_7_1) {
                SphericalMercator_7 = SphericalMercator_7_1;
            }
        ],
        execute: function () {
            topLeftCorner = new Cartesian_7.Cartesian();
            bottomRightCorner = new Cartesian_7.Cartesian();
            SceneMode = /** @class */ (function () {
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
                    SphericalMercator_7.sphericalMercator.FCartographicToCartesian(this._topLeftCartographicCorner, topLeftCorner);
                    this._bottomRightCartographicCorner.longitude = (tile.x + 1) * width - 180.0;
                    this._bottomRightCartographicCorner.altitude = 0;
                    this._bottomRightCartographicCorner.latitude = 90.0 - (tile.y + 1) * height;
                    SphericalMercator_7.sphericalMercator.FCartographicToCartesian(this._bottomRightCartographicCorner, bottomRightCorner);
                    return new AABB_1.AABB({ topLeftCorner: topLeftCorner, bottomRightCorner: bottomRightCorner });
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
            exports_31("SceneMode", SceneMode);
        }
    };
});
System.register("src/Core/Map3D", ["three", "src/Object/Polygon", "src/Object/Polyline", "src/Object/Skybox", "src/Object/Vehicle", "src/Renderer/Camera", "src/Renderer/OrbitControls", "src/Utility/SphericalMercator", "src/Core/MapSettings", "src/Core/QuadTree"], function (exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    var THREE, Polygon_1, Polyline_1, Skybox_1, Vehicle_1, Camera_1, OrbitControls_1, SphericalMercator_8, MapSettings_8, QuadTree_1, Map3D;
    return {
        setters: [
            function (THREE_14) {
                THREE = THREE_14;
            },
            function (Polygon_1_1) {
                Polygon_1 = Polygon_1_1;
            },
            function (Polyline_1_1) {
                Polyline_1 = Polyline_1_1;
            },
            function (Skybox_1_1) {
                Skybox_1 = Skybox_1_1;
            },
            function (Vehicle_1_1) {
                Vehicle_1 = Vehicle_1_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            },
            function (OrbitControls_1_1) {
                OrbitControls_1 = OrbitControls_1_1;
            },
            function (SphericalMercator_8_1) {
                SphericalMercator_8 = SphericalMercator_8_1;
            },
            function (MapSettings_8_1) {
                MapSettings_8 = MapSettings_8_1;
            },
            function (QuadTree_1_1) {
                QuadTree_1 = QuadTree_1_1;
            }
        ],
        execute: function () {
            Map3D = /** @class */ (function () {
                function Map3D(options) {
                    this._subscribeObjects = [];
                    this._renderer = options.renderer;
                    this.scene = new THREE.Scene();
                    this.camera = new Camera_1.Camera({ canvas: options.canvas, map: this });
                    this.camera.setPosition({ z: MapSettings_8.MapSettings.cameraDistance });
                    // TODO: target distance min 0.03527380584401122
                    this.cameraController = new OrbitControls_1.OrbitControls({
                        map: this,
                        eventSource: options.eventSource,
                        canvas: options.canvas,
                    });
                    this.canvas = options.canvas;
                    this.context2d = options.context2d;
                    this.quadTree = new QuadTree_1.QuadTree({
                        map: this,
                        mode: options.mode,
                    });
                    this.missions = [];
                    this.newMission();
                    // Add skybox
                    var skybox = new Skybox_1.Skybox();
                    this.scene.add(skybox);
                    /**
                     * @type {Vehicle}
                     */
                    this.vehicle = new Vehicle_1.Vehicle({ map: this });
                    this.state = Map3D.State.GROUND;
                }
                Object.defineProperty(Map3D.prototype, "currentMission", {
                    get: function () {
                        if (!this._currentMission) {
                            this._currentMission = new Polygon_1.Polygon({ map: this });
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
                    this._currentMission = (type === 'Polyline') ? new Polyline_1.Polyline({ map: this }) : new Polygon_1.Polygon({ map: this });
                    this.missions.push(this._currentMission);
                    return this._currentMission;
                };
                Map3D.prototype.update = function () {
                    // Quad Tree update
                    this.quadTree.update();
                    // Mission update
                    var scale = this.cameraController.constraint.targetDistance *
                        SphericalMercator_8.sphericalMercator.mPerPixel() * 4.0 / this.canvas.height;
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
            exports_32("Map3D", Map3D);
        }
    };
});
System.register("src/Core/index", ["src/Core/Map3D"], function (exports_33, context_33) {
    "use strict";
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [
            function (Map3D_1_1) {
                exports_33({
                    "Map3D": Map3D_1_1["Map3D"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("src/SceneMode/Tile2D", ["three", "src/DataSource/DataSource", "src/DataSource/ImageDataLayer", "src/SceneMode/Tile"], function (exports_34, context_34) {
    "use strict";
    var __moduleName = context_34 && context_34.id;
    var THREE, DataSource_1, ImageDataLayer_1, Tile_1, image, Tile2D;
    return {
        setters: [
            function (THREE_15) {
                THREE = THREE_15;
            },
            function (DataSource_1_1) {
                DataSource_1 = DataSource_1_1;
            },
            function (ImageDataLayer_1_1) {
                ImageDataLayer_1 = ImageDataLayer_1_1;
            },
            function (Tile_1_1) {
                Tile_1 = Tile_1_1;
            }
        ],
        execute: function () {
            image = new Image();
            Tile2D = /** @class */ (function (_super) {
                __extends(Tile2D, _super);
                function Tile2D(options) {
                    var _this = _super.call(this, options) || this;
                    _this.data = new DataSource_1.DataSource({
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
                    var tileSize = Tile_1.Tile.size(this.z);
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
                Tile2D.dataLayers = DataSource_1.DataSource.toLayers([ImageDataLayer_1.ImageDataLayer]);
                return Tile2D;
            }(Tile_1.Tile));
            exports_34("Tile2D", Tile2D);
        }
    };
});
System.register("src/DataSource/ImageDataLayer", ["three", "src/DataSource/DataSource", "src/DataSource/DataSourceLayer"], function (exports_35, context_35) {
    "use strict";
    var __moduleName = context_35 && context_35.id;
    var THREE, DataSource_2, DataSourceLayer_1, ImageDataLayer;
    return {
        setters: [
            function (THREE_16) {
                THREE = THREE_16;
            },
            function (DataSource_2_1) {
                DataSource_2 = DataSource_2_1;
            },
            function (DataSourceLayer_1_1) {
                DataSourceLayer_1 = DataSourceLayer_1_1;
            }
        ],
        execute: function () {
            ImageDataLayer = /** @class */ (function (_super) {
                __extends(ImageDataLayer, _super);
                function ImageDataLayer() {
                    return _super.call(this) || this;
                }
                ImageDataLayer.prototype.processLoading = function (tile) {
                    tile.data.status[ImageDataLayer.layerName] = DataSource_2.DataSource.State.Loading;
                };
                ImageDataLayer.prototype.processData = function (tile, data) {
                    if (tile.material) {
                        throw new Error('Material\'s already set up.');
                    }
                    tile.material = new THREE.MeshBasicMaterial({
                        map: data,
                    });
                    tile.data.status[ImageDataLayer.layerName] = DataSource_2.DataSource.State.Loaded;
                };
                ImageDataLayer.prototype.processError = function (tile, error) {
                    tile.data.status[ImageDataLayer.layerName] = DataSource_2.DataSource.State.Idle;
                };
                ImageDataLayer.layerName = 'texture';
                return ImageDataLayer;
            }(DataSourceLayer_1.DataSourceLayer));
            exports_35("ImageDataLayer", ImageDataLayer);
        }
    };
});
System.register("src/DataSource/ImageryProvider", ["three", "src/DataSource/ImageDataLayer", "src/DataSource/Provider"], function (exports_36, context_36) {
    "use strict";
    var __moduleName = context_36 && context_36.id;
    var THREE, ImageDataLayer_2, Provider_1, ImageryProvider;
    return {
        setters: [
            function (THREE_17) {
                THREE = THREE_17;
            },
            function (ImageDataLayer_2_1) {
                ImageDataLayer_2 = ImageDataLayer_2_1;
            },
            function (Provider_1_1) {
                Provider_1 = Provider_1_1;
            }
        ],
        execute: function () {
            ImageryProvider = /** @class */ (function (_super) {
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
                    if (this._loading >= this._maxLoad || tile.data.isLoading(ImageDataLayer_2.ImageDataLayer.layerName)) {
                        return;
                    }
                    var scope = this;
                    var onComplete = function (resp) {
                        scope._needUpdate = true;
                        scope._loading--;
                        if (tile.disposed) {
                            return;
                        }
                        tile.data.loaded(ImageDataLayer_2.ImageDataLayer.layerName, texture);
                    };
                    var onError = function (err) {
                        if (err) {
                            if (tile.disposed) {
                                return;
                            }
                            scope._loading--;
                            console.error('Error loading texture' + tile.stringify);
                            tile.data.failed(ImageDataLayer_2.ImageDataLayer.layerName, err);
                        }
                    };
                    this._loading++;
                    var texture = new THREE.TextureLoader()
                        .load(this.url(tile.x, tile.y, tile.z), onComplete, undefined, onError);
                    tile.data.loading(ImageDataLayer_2.ImageDataLayer.layerName);
                };
                return ImageryProvider;
            }(Provider_1.Provider));
            exports_36("ImageryProvider", ImageryProvider);
        }
    };
});
System.register("src/SceneMode/Scene2D", ["src/Core/TilingScheme", "src/DataSource/ImageryProvider", "src/SceneMode/SceneMode", "src/SceneMode/Tile2D"], function (exports_37, context_37) {
    "use strict";
    var __moduleName = context_37 && context_37.id;
    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TilingScheme_1, ImageryProvider_1, SceneMode_1, Tile2D_1, Scene2D;
    return {
        setters: [
            function (TilingScheme_1_1) {
                TilingScheme_1 = TilingScheme_1_1;
            },
            function (ImageryProvider_1_1) {
                ImageryProvider_1 = ImageryProvider_1_1;
            },
            function (SceneMode_1_1) {
                SceneMode_1 = SceneMode_1_1;
            },
            function (Tile2D_1_1) {
                Tile2D_1 = Tile2D_1_1;
            }
        ],
        execute: function () {
            Scene2D = /** @class */ (function (_super) {
                __extends(Scene2D, _super);
                function Scene2D() {
                    var _this = _super.call(this, {
                        instance: Tile2D_1.Tile2D,
                    }) || this;
                    _this._tilingScheme = new TilingScheme_1.TilingScheme({
                        numberOfLevelZeroTilesX: 1,
                        numberOfLevelZeroTilesY: 1,
                    });
                    _this.providers = [
                        new ImageryProvider_1.ImageryProvider(),
                    ];
                    _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 65, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
                    return _this;
                }
                return Scene2D;
            }(SceneMode_1.SceneMode));
            exports_37("Scene2D", Scene2D);
        }
    };
});
System.register("src/DataSource/EPSG4326MapImageDataLayer", ["three", "src/DataSource/DataSource", "src/DataSource/DataSourceLayer"], function (exports_38, context_38) {
    "use strict";
    var __moduleName = context_38 && context_38.id;
    var THREE, DataSource_3, DataSourceLayer_2, EPSG4326MapImageDataLayer;
    return {
        setters: [
            function (THREE_18) {
                THREE = THREE_18;
            },
            function (DataSource_3_1) {
                DataSource_3 = DataSource_3_1;
            },
            function (DataSourceLayer_2_1) {
                DataSourceLayer_2 = DataSourceLayer_2_1;
            }
        ],
        execute: function () {
            EPSG4326MapImageDataLayer = /** @class */ (function (_super) {
                __extends(EPSG4326MapImageDataLayer, _super);
                function EPSG4326MapImageDataLayer() {
                    return _super.call(this) || this;
                }
                EPSG4326MapImageDataLayer.prototype.processLoading = function (tile) {
                    tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource_3.DataSource.State.Loading;
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
                    tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource_3.DataSource.State.Loaded;
                };
                EPSG4326MapImageDataLayer.prototype.processError = function (tile, error) {
                    tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource_3.DataSource.State.Idle;
                };
                EPSG4326MapImageDataLayer.layerName = 'EPSG:4326';
                EPSG4326MapImageDataLayer.vertexShader = "\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vViewPosition;\n\n        void main() {\n\n            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n            vUv = uv;\n            vNormal = normalize( normalMatrix * normal );\n            vViewPosition = -mvPosition.xyz;\n\n            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n        }\n    ";
                EPSG4326MapImageDataLayer.fragmentShader = "\n        uniform sampler2D texture;\n        uniform sampler2D texture2;\n        uniform vec3 color;\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vViewPosition;\n\n        void main() {\n            if ( vUv.y < 0.5) {\n                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 );\n                gl_FragColor = texture2D( texture2, halfvUv );\n            } else {\n                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 - 1.0 );\n                gl_FragColor = texture2D( texture, halfvUv );\n            }\n\n            // hack in a fake pointlight at camera location, plus ambient\n            // vec3 normal = normalize( vNormal );\n            // vec3 lightDir = normalize( vViewPosition );\n\n            // float dotProduct = max( dot( normal, lightDir ), 0.0 ) + 0.2;\n\n            // //gl_FragColor = vec4( mix( tColor.rgb, tColor2.rgb, tColor2.a ), 1.0 ) * dotProduct;\n\n            // vec4 mix_c = tColor2 + tc * tColor2.a;\n            // gl_FragColor = vec4( mix( tColor.rgb, mix_c.xyz, tColor2.a ), 1.0 ) * dotProduct;\n            // gl_FragColor = vec4( vUv.x, vUv.y, 0.0, 1.0 );\n        }\n    ";
                return EPSG4326MapImageDataLayer;
            }(DataSourceLayer_2.DataSourceLayer));
            exports_38("EPSG4326MapImageDataLayer", EPSG4326MapImageDataLayer);
        }
    };
});
System.register("src/DataSource/EPSG4326MapImageryProvider", ["three", "src/DataSource/EPSG4326MapImageDataLayer", "src/DataSource/Provider"], function (exports_39, context_39) {
    "use strict";
    var __moduleName = context_39 && context_39.id;
    var THREE, EPSG4326MapImageDataLayer_1, Provider_2, EPSG4326MapImageryProvider;
    return {
        setters: [
            function (THREE_19) {
                THREE = THREE_19;
            },
            function (EPSG4326MapImageDataLayer_1_1) {
                EPSG4326MapImageDataLayer_1 = EPSG4326MapImageDataLayer_1_1;
            },
            function (Provider_2_1) {
                Provider_2 = Provider_2_1;
            }
        ],
        execute: function () {
            EPSG4326MapImageryProvider = /** @class */ (function (_super) {
                __extends(EPSG4326MapImageryProvider, _super);
                function EPSG4326MapImageryProvider(options) {
                    var _this = _super.call(this, options) || this;
                    _this._ready = false;
                    options = options || {};
                    var key = options.key || 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';
                    var meta = new XMLHttpRequest();
                    meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);
                    var scope = _this;
                    var onMetaComplete = function () {
                        if (meta.readyState === XMLHttpRequest.DONE) {
                            var response = JSON.parse(meta.response);
                            var resources = response.resourceSets[0].resources[0];
                            scope._baseUrl = resources.imageUrl;
                            scope._subdomains = resources.imageUrlSubdomains;
                            scope._zoomMax = resources.zoomMax;
                            scope._zoomMin = resources.zoomMin - 1;
                            scope._ready = true;
                        }
                    };
                    meta.onreadystatechange = onMetaComplete;
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
                    if (!this._ready) {
                        tile.quadTree.needUpdate = true;
                        return;
                    }
                    if (this._loading >= this._maxLoad || tile.data.isLoading(EPSG4326MapImageDataLayer_1.EPSG4326MapImageDataLayer.layerName)) {
                        return;
                    }
                    // FIXME: Debugging
                    // if (tile.z >= 1) return;
                    var doneCount = 0;
                    var scope = this;
                    var onComplete = function (resp) {
                        scope._needUpdate = true;
                        scope._loading--;
                        if (tile.disposed) {
                            return;
                        }
                        doneCount++;
                        if (doneCount === 2) {
                            tile.data.loaded(EPSG4326MapImageDataLayer_1.EPSG4326MapImageDataLayer.layerName, [t0, t1]);
                        }
                    };
                    var onError = function (err) {
                        if (err) {
                            if (tile.disposed) {
                                return;
                            }
                            scope._loading--;
                            console.error('Error loading texture' + tile.stringify);
                            tile.data.failed(EPSG4326MapImageDataLayer_1.EPSG4326MapImageDataLayer.layerName, err);
                        }
                    };
                    this._loading++;
                    var t0 = new THREE.TextureLoader()
                        .load(this.url(tile.x, tile.y * 2, tile.z), onComplete, undefined, onError);
                    var t1 = new THREE.TextureLoader()
                        .load(this.url(tile.x, tile.y * 2 + 1, tile.z), onComplete, undefined, onError);
                    tile.data.loading(EPSG4326MapImageDataLayer_1.EPSG4326MapImageDataLayer.layerName);
                };
                return EPSG4326MapImageryProvider;
            }(Provider_2.Provider));
            exports_39("EPSG4326MapImageryProvider", EPSG4326MapImageryProvider);
        }
    };
});
System.register("src/SceneMode/TestTile", ["three", "src/DataSource/DataSource", "src/DataSource/TestDataLayer", "src/SceneMode/Tile"], function (exports_40, context_40) {
    "use strict";
    var __moduleName = context_40 && context_40.id;
    var THREE, DataSource_4, TestDataLayer_1, Tile_2, image, TestTile;
    return {
        setters: [
            function (THREE_20) {
                THREE = THREE_20;
            },
            function (DataSource_4_1) {
                DataSource_4 = DataSource_4_1;
            },
            function (TestDataLayer_1_1) {
                TestDataLayer_1 = TestDataLayer_1_1;
            },
            function (Tile_2_1) {
                Tile_2 = Tile_2_1;
            }
        ],
        execute: function () {
            image = new Image();
            TestTile = /** @class */ (function (_super) {
                __extends(TestTile, _super);
                function TestTile(options) {
                    var _this = _super.call(this, options) || this;
                    _this.data = new DataSource_4.DataSource({
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
                    var tileSize = Tile_2.Tile.size(this.z);
                    mesh.scale.set(tileSize / 2, 1, tileSize);
                    // const tileSize = Tile.size(this.z);
                    // mesh.material = this._material;
                    // mesh.scale.set(tileSize / 2, 10, tileSize);
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
                TestTile.dataLayers = DataSource_4.DataSource.toLayers([TestDataLayer_1.TestDataLayer]);
                return TestTile;
            }(Tile_2.Tile));
            exports_40("TestTile", TestTile);
        }
    };
});
System.register("src/DataSource/TestDataLayer", ["src/DataSource/DataSource", "src/DataSource/DataSourceLayer"], function (exports_41, context_41) {
    "use strict";
    var __moduleName = context_41 && context_41.id;
    var DataSource_5, DataSourceLayer_3, TestDataLayer;
    return {
        setters: [
            function (DataSource_5_1) {
                DataSource_5 = DataSource_5_1;
            },
            function (DataSourceLayer_3_1) {
                DataSourceLayer_3 = DataSourceLayer_3_1;
            }
        ],
        execute: function () {
            TestDataLayer = /** @class */ (function (_super) {
                __extends(TestDataLayer, _super);
                function TestDataLayer() {
                    return _super.call(this) || this;
                }
                TestDataLayer.prototype.processLoading = function (tile) {
                    tile.data.status[TestDataLayer.layerName] = DataSource_5.DataSource.State.Loading;
                };
                TestDataLayer.prototype.processData = function (tile) {
                    tile.data.status[TestDataLayer.layerName] = DataSource_5.DataSource.State.Loaded;
                };
                TestDataLayer.prototype.processError = function (tile, error) {
                    throw new Error('Debug data can\'t be error.');
                };
                TestDataLayer.layerName = 'test';
                return TestDataLayer;
            }(DataSourceLayer_3.DataSourceLayer));
            exports_41("TestDataLayer", TestDataLayer);
        }
    };
});
System.register("src/DataSource/TestProvider", ["src/DataSource/Provider", "src/DataSource/TestDataLayer"], function (exports_42, context_42) {
    "use strict";
    var __moduleName = context_42 && context_42.id;
    var Provider_3, TestDataLayer_2, TestProvider;
    return {
        setters: [
            function (Provider_3_1) {
                Provider_3 = Provider_3_1;
            },
            function (TestDataLayer_2_1) {
                TestDataLayer_2 = TestDataLayer_2_1;
            }
        ],
        execute: function () {
            TestProvider = /** @class */ (function (_super) {
                __extends(TestProvider, _super);
                function TestProvider(options) {
                    return _super.call(this, options) || this;
                }
                TestProvider.prototype.url = function () {
                    throw new Error('Can\'t call url of TestProvide');
                };
                TestProvider.prototype.loadTile = function (tile) {
                    if (this._loading >= this._maxLoad) {
                        return;
                    }
                    if (tile.data.isLoading(TestDataLayer_2.TestDataLayer.layerName)) {
                        return;
                    }
                    var scope = this;
                    if (typeof Qt === 'object') {
                        timer.setTimeout(function () {
                            tile.data.loaded(TestDataLayer_2.TestDataLayer.layerName);
                            scope._loading--;
                        }, 10);
                    }
                    else {
                        setTimeout(function () {
                            tile.data.loaded(TestDataLayer_2.TestDataLayer.layerName);
                            scope._loading--;
                        }, 10);
                    }
                    tile.data.loading(TestDataLayer_2.TestDataLayer.layerName);
                };
                return TestProvider;
            }(Provider_3.Provider));
            exports_42("TestProvider", TestProvider);
        }
    };
});
System.register("src/SceneMode/TestScene", ["src/Core/TilingScheme", "src/DataSource/TestProvider", "src/SceneMode/SceneMode", "src/SceneMode/TestTile"], function (exports_43, context_43) {
    "use strict";
    var __moduleName = context_43 && context_43.id;
    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TilingScheme_2, TestProvider_1, SceneMode_2, TestTile_1, TestScene;
    return {
        setters: [
            function (TilingScheme_2_1) {
                TilingScheme_2 = TilingScheme_2_1;
            },
            function (TestProvider_1_1) {
                TestProvider_1 = TestProvider_1_1;
            },
            function (SceneMode_2_1) {
                SceneMode_2 = SceneMode_2_1;
            },
            function (TestTile_1_1) {
                TestTile_1 = TestTile_1_1;
            }
        ],
        execute: function () {
            TestScene = /** @class */ (function (_super) {
                __extends(TestScene, _super);
                function TestScene() {
                    var _this = _super.call(this, {
                        instance: TestTile_1.TestTile,
                    }) || this;
                    _this._tilingScheme = new TilingScheme_2.TilingScheme({
                        numberOfLevelZeroTilesX: 4,
                        numberOfLevelZeroTilesY: 2,
                    });
                    _this.providers = [
                        // new EPSG4326MapImageryProvider(),
                        new TestProvider_1.TestProvider(),
                    ];
                    _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 65, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
                    return _this;
                }
                return TestScene;
            }(SceneMode_2.SceneMode));
            exports_43("TestScene", TestScene);
        }
    };
});
System.register("src/DataSource/BingMapImageryProvider", ["src/DataSource/ImageryProvider"], function (exports_44, context_44) {
    "use strict";
    var __moduleName = context_44 && context_44.id;
    var ImageryProvider_2, BingMapImageryProvider;
    return {
        setters: [
            function (ImageryProvider_2_1) {
                ImageryProvider_2 = ImageryProvider_2_1;
            }
        ],
        execute: function () {
            BingMapImageryProvider = /** @class */ (function (_super) {
                __extends(BingMapImageryProvider, _super);
                function BingMapImageryProvider(options) {
                    var _this = _super.call(this, options) || this;
                    _this._ready = false;
                    options = options || {};
                    var key = options.key || 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';
                    var meta = new XMLHttpRequest();
                    meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);
                    var scope = _this;
                    var onMetaComplete = function () {
                        if (meta.readyState === XMLHttpRequest.DONE) {
                            var response = JSON.parse(meta.response);
                            var resources = response.resourceSets[0].resources[0];
                            scope._baseUrl = resources.imageUrl;
                            scope._subdomains = resources.imageUrlSubdomains;
                            scope._zoomMax = resources.zoomMax;
                            scope._zoomMin = resources.zoomMin - 1;
                            scope._ready = true;
                        }
                    };
                    meta.onreadystatechange = onMetaComplete;
                    meta.send();
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
            }(ImageryProvider_2.ImageryProvider));
            exports_44("BingMapImageryProvider", BingMapImageryProvider);
        }
    };
});
System.register("src/SceneMode/BingMapScene", ["src/Core/TilingScheme", "src/DataSource/BingMapImageryProvider", "src/SceneMode/SceneMode", "src/SceneMode/Tile2D"], function (exports_45, context_45) {
    "use strict";
    var __moduleName = context_45 && context_45.id;
    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TilingScheme_3, BingMapImageryProvider_1, SceneMode_3, Tile2D_2, BingMapScene;
    return {
        setters: [
            function (TilingScheme_3_1) {
                TilingScheme_3 = TilingScheme_3_1;
            },
            function (BingMapImageryProvider_1_1) {
                BingMapImageryProvider_1 = BingMapImageryProvider_1_1;
            },
            function (SceneMode_3_1) {
                SceneMode_3 = SceneMode_3_1;
            },
            function (Tile2D_2_1) {
                Tile2D_2 = Tile2D_2_1;
            }
        ],
        execute: function () {
            BingMapScene = /** @class */ (function (_super) {
                __extends(BingMapScene, _super);
                function BingMapScene() {
                    var _this = _super.call(this, {
                        instance: Tile2D_2.Tile2D,
                    }) || this;
                    _this._tilingScheme = new TilingScheme_3.TilingScheme({
                        numberOfLevelZeroTilesX: 2,
                        numberOfLevelZeroTilesY: 2,
                    });
                    _this.providers = [
                        new BingMapImageryProvider_1.BingMapImageryProvider(),
                    ];
                    _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 45, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
                    return _this;
                }
                return BingMapScene;
            }(SceneMode_3.SceneMode));
            exports_45("BingMapScene", BingMapScene);
        }
    };
});
System.register("src/Utility/TypeConversion", [], function (exports_46, context_46) {
    "use strict";
    var __moduleName = context_46 && context_46.id;
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
    exports_46("highwaterDecode", highwaterDecode);
    function zigZagDecode(value) {
        return (value >> 1) ^ (-(value & 1));
    }
    exports_46("zigZagDecode", zigZagDecode);
    function getUint32Array(data, startPos, count) {
        return new Uint32Array(data.slice(startPos, startPos + 4 * count));
    }
    exports_46("getUint32Array", getUint32Array);
    function getUint32(data, startPos) {
        return getUint32Array(data, startPos, 1)[0];
    }
    exports_46("getUint32", getUint32);
    function getUint16Array(data, startPos, count) {
        return new Uint16Array(data.slice(startPos, startPos + 2 * count));
    }
    exports_46("getUint16Array", getUint16Array);
    function getUint16(data, startPos) {
        return getUint16Array(data, startPos, 1)[0];
    }
    exports_46("getUint16", getUint16);
    function getFloat64Array(data, startPos, count) {
        return new Float64Array(data.slice(startPos, startPos + 8 * count));
    }
    exports_46("getFloat64Array", getFloat64Array);
    function getFloat64(data, startPos) {
        return getFloat64Array(data, startPos, 1)[0];
    }
    exports_46("getFloat64", getFloat64);
    function getFloat32Array(data, startPos, count) {
        return new Float32Array(data.slice(startPos, startPos + 4 * count));
    }
    exports_46("getFloat32Array", getFloat32Array);
    function getFloat32(data, startPos) {
        return getFloat32Array(data, startPos, 1)[0];
    }
    exports_46("getFloat32", getFloat32);
    var UINT16_BYTE_SIZE, UINT32_BYTE_SIZE, FLOAT64_BYTE_SIZE, FLOAT32_BYTE_SIZE;
    return {
        setters: [],
        execute: function () {
            exports_46("UINT16_BYTE_SIZE", UINT16_BYTE_SIZE = 2);
            exports_46("UINT32_BYTE_SIZE", UINT32_BYTE_SIZE = 4);
            exports_46("FLOAT64_BYTE_SIZE", FLOAT64_BYTE_SIZE = 8);
            exports_46("FLOAT32_BYTE_SIZE", FLOAT32_BYTE_SIZE = 4);
        }
    };
});
System.register("src/SceneMode/STKTerrainTile", ["three", "src/DataSource/DataSource", "src/DataSource/EPSG4326MapImageDataLayer", "src/DataSource/STKTerrainDataLayer", "src/SceneMode/Tile"], function (exports_47, context_47) {
    "use strict";
    var __moduleName = context_47 && context_47.id;
    var THREE, DataSource_6, EPSG4326MapImageDataLayer_2, STKTerrainDataLayer_1, Tile_3, image, STKTerrainTile;
    return {
        setters: [
            function (THREE_21) {
                THREE = THREE_21;
            },
            function (DataSource_6_1) {
                DataSource_6 = DataSource_6_1;
            },
            function (EPSG4326MapImageDataLayer_2_1) {
                EPSG4326MapImageDataLayer_2 = EPSG4326MapImageDataLayer_2_1;
            },
            function (STKTerrainDataLayer_1_1) {
                STKTerrainDataLayer_1 = STKTerrainDataLayer_1_1;
            },
            function (Tile_3_1) {
                Tile_3 = Tile_3_1;
            }
        ],
        execute: function () {
            image = new Image();
            STKTerrainTile = /** @class */ (function (_super) {
                __extends(STKTerrainTile, _super);
                function STKTerrainTile(options) {
                    var _this = _super.call(this, options) || this;
                    _this.data = new DataSource_6.DataSource({
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
                    var tileSize = Tile_3.Tile.size(this.z);
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
                STKTerrainTile.dataLayers = DataSource_6.DataSource.toLayers([
                    EPSG4326MapImageDataLayer_2.EPSG4326MapImageDataLayer,
                    STKTerrainDataLayer_1.STKTerrainDataLayer,
                ]);
                return STKTerrainTile;
            }(Tile_3.Tile));
            exports_47("STKTerrainTile", STKTerrainTile);
        }
    };
});
System.register("src/DataSource/STKTerrainDataLayer", ["three", "src/Utility/MapUtility", "src/DataSource/DataSource", "src/DataSource/DataSourceLayer"], function (exports_48, context_48) {
    "use strict";
    var __moduleName = context_48 && context_48.id;
    var THREE, MapUtility_6, DataSource_7, DataSourceLayer_4, maxShort, STKTerrainDataLayer;
    return {
        setters: [
            function (THREE_22) {
                THREE = THREE_22;
            },
            function (MapUtility_6_1) {
                MapUtility_6 = MapUtility_6_1;
            },
            function (DataSource_7_1) {
                DataSource_7 = DataSource_7_1;
            },
            function (DataSourceLayer_4_1) {
                DataSourceLayer_4 = DataSourceLayer_4_1;
            }
        ],
        execute: function () {
            maxShort = 32767;
            STKTerrainDataLayer = /** @class */ (function (_super) {
                __extends(STKTerrainDataLayer, _super);
                function STKTerrainDataLayer() {
                    return _super.call(this) || this;
                }
                STKTerrainDataLayer.prototype.getVertices = function (header, uArray, vArray, heightArray, indexArray) {
                    return uArray.reduce(function (prev, _, index) {
                        prev.push(new THREE.Vector3(uArray[index] / maxShort - 0.5, MapUtility_6.MapUtility.lerp(header.minimumHeight, header.maximumHeight, heightArray[index] / maxShort)
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
                    tile.data.status[STKTerrainDataLayer.layerName] = DataSource_7.DataSource.State.Loading;
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
                    tile.data.status[STKTerrainDataLayer.layerName] = DataSource_7.DataSource.State.Loaded;
                };
                STKTerrainDataLayer.prototype.processError = function (tile, error) {
                    tile.data.status[STKTerrainDataLayer.layerName] = DataSource_7.DataSource.State.Idle;
                };
                STKTerrainDataLayer.layerName = 'terrain-stk';
                return STKTerrainDataLayer;
            }(DataSourceLayer_4.DataSourceLayer));
            exports_48("STKTerrainDataLayer", STKTerrainDataLayer);
        }
    };
});
System.register("src/DataSource/STKTerrainProvider", ["src/Utility/TypeConversion", "src/DataSource/Provider", "src/DataSource/STKTerrainDataLayer"], function (exports_49, context_49) {
    "use strict";
    var __moduleName = context_49 && context_49.id;
    var c, Provider_4, STKTerrainDataLayer_2, STKTerrainProvider;
    return {
        setters: [
            function (c_1) {
                c = c_1;
            },
            function (Provider_4_1) {
                Provider_4 = Provider_4_1;
            },
            function (STKTerrainDataLayer_2_1) {
                STKTerrainDataLayer_2 = STKTerrainDataLayer_2_1;
            }
        ],
        execute: function () {
            STKTerrainProvider = /** @class */ (function (_super) {
                __extends(STKTerrainProvider, _super);
                function STKTerrainProvider(options) {
                    var _this = _super.call(this, options) || this;
                    _this._ready = false;
                    var meta = new XMLHttpRequest();
                    // meta.open('GET', 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/layer.json', true);
                    meta.open('GET', 'layer.json', true);
                    var scope = _this;
                    var onMetaComplete = function () {
                        var response = JSON.parse(meta.response);
                        scope._baseUrl = "http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/" + response.tiles;
                        scope._zoomMax = response.maxzoom;
                        scope._zoomMin = response.minzoom;
                        scope._version = response.version;
                        scope._projection = response.projection;
                        scope._ready = true;
                    };
                    meta.setRequestHeader('Accept', 'application/json,*/*;q=0.01');
                    meta.addEventListener('load', onMetaComplete);
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
                        centerX: c.getFloat64(data, byteCount),
                        centerY: c.getFloat64(data, byteCount + 8),
                        centerZ: c.getFloat64(data, byteCount + 16),
                        minimumHeight: c.getFloat32(data, byteCount + 24),
                        maximumHeight: c.getFloat32(data, byteCount + 28),
                        boundingSphereCenterX: c.getFloat64(data, byteCount + 32),
                        boundingSphereCenterY: c.getFloat64(data, byteCount + 40),
                        boundingSphereCenterZ: c.getFloat64(data, byteCount + 48),
                        boundingSphereRadius: c.getFloat64(data, byteCount + 56),
                        horizonOcclusionPointX: c.getFloat64(data, byteCount + 64),
                        horizonOcclusionPointY: c.getFloat64(data, byteCount + 72),
                        horizonOcclusionPointZ: c.getFloat64(data, byteCount + 80),
                    };
                };
                STKTerrainProvider.prototype.parseTile = function (data) {
                    var byteCount = 0;
                    var header = this.getHeader(data, byteCount);
                    byteCount += 88;
                    var vertexCount = c.getUint32(data, byteCount);
                    byteCount += c.UINT32_BYTE_SIZE;
                    var uArray = c.getUint16Array(data, byteCount, vertexCount);
                    byteCount += vertexCount * c.UINT16_BYTE_SIZE;
                    var vArray = c.getUint16Array(data, byteCount, vertexCount);
                    byteCount += vertexCount * c.UINT16_BYTE_SIZE;
                    var heightArray = c.getUint16Array(data, byteCount, vertexCount);
                    byteCount += vertexCount * c.UINT16_BYTE_SIZE;
                    var i;
                    var u = 0;
                    var v = 0;
                    var height = 0;
                    for (i = 0; i < uArray.length; ++i) {
                        u += c.zigZagDecode(uArray[i]);
                        v += c.zigZagDecode(vArray[i]);
                        height += c.zigZagDecode(heightArray[i]);
                        uArray[i] = u;
                        vArray[i] = v;
                        heightArray[i] = height;
                    }
                    if (byteCount % 2 !== 0) {
                        byteCount += (2 - (byteCount % 2));
                    }
                    var triangleCount = c.getUint32(data, byteCount);
                    byteCount += c.UINT32_BYTE_SIZE;
                    var indices = c.getUint16Array(data, byteCount, triangleCount * 3);
                    byteCount += triangleCount * 3 * 2;
                    var indexArray = c.highwaterDecode(indices);
                    return { header: header, uArray: uArray, vArray: vArray, heightArray: heightArray, indexArray: indexArray };
                };
                STKTerrainProvider.prototype.loadTile = function (tile) {
                    var _this = this;
                    if (!this._ready) {
                        tile.quadTree.needUpdate = true;
                        return;
                    }
                    if (this._loading >= this._maxLoad || tile.data.isLoading(STKTerrainDataLayer_2.STKTerrainDataLayer.layerName)) {
                        return;
                    }
                    // FIXME: Debugging
                    // if (tile.z >= 1) return;
                    this._loading++;
                    var onComplete = function (resp) {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            _this._needUpdate = true;
                            _this._loading--;
                            if (tile.disposed) {
                                return;
                            }
                            tile.data.loaded(STKTerrainDataLayer_2.STKTerrainDataLayer.layerName, _this.parseTile(xhr.response));
                        }
                    };
                    var onError = function (err) {
                        if (err) {
                            if (tile.disposed) {
                                return;
                            }
                            _this._loading--;
                            console.error('Error loading stk-terrain' + tile.stringify);
                            tile.data.failed(STKTerrainDataLayer_2.STKTerrainDataLayer.layerName, err);
                        }
                    };
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', this.url(tile.x, tile.y, tile.z), true);
                    xhr.setRequestHeader('Accept', ' application/vnd.quantized-mesh,application/octet-stream;q=1.0');
                    xhr.responseType = 'arraybuffer';
                    xhr.onreadystatechange = onComplete;
                    xhr.send();
                    tile.data.loading(STKTerrainDataLayer_2.STKTerrainDataLayer.layerName);
                };
                return STKTerrainProvider;
            }(Provider_4.Provider));
            exports_49("STKTerrainProvider", STKTerrainProvider);
        }
    };
});
System.register("src/SceneMode/STKTerrainScene", ["src/Core/TilingScheme", "src/DataSource/EPSG4326MapImageryProvider", "src/DataSource/STKTerrainProvider", "src/Math/Cartesian", "src/SceneMode/SceneMode", "src/SceneMode/STKTerrainTile"], function (exports_50, context_50) {
    "use strict";
    var __moduleName = context_50 && context_50.id;
    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TilingScheme_4, EPSG4326MapImageryProvider_1, STKTerrainProvider_1, Cartesian_8, SceneMode_4, STKTerrainTile_1, topLeftCorner, bottomRightCorner, STKTerrainScene;
    return {
        setters: [
            function (TilingScheme_4_1) {
                TilingScheme_4 = TilingScheme_4_1;
            },
            function (EPSG4326MapImageryProvider_1_1) {
                EPSG4326MapImageryProvider_1 = EPSG4326MapImageryProvider_1_1;
            },
            function (STKTerrainProvider_1_1) {
                STKTerrainProvider_1 = STKTerrainProvider_1_1;
            },
            function (Cartesian_8_1) {
                Cartesian_8 = Cartesian_8_1;
            },
            function (SceneMode_4_1) {
                SceneMode_4 = SceneMode_4_1;
            },
            function (STKTerrainTile_1_1) {
                STKTerrainTile_1 = STKTerrainTile_1_1;
            }
        ],
        execute: function () {
            topLeftCorner = new Cartesian_8.Cartesian();
            bottomRightCorner = new Cartesian_8.Cartesian();
            STKTerrainScene = /** @class */ (function (_super) {
                __extends(STKTerrainScene, _super);
                function STKTerrainScene() {
                    var _this = _super.call(this, {
                        instance: STKTerrainTile_1.STKTerrainTile,
                    }) || this;
                    _this._tilingScheme = new TilingScheme_4.TilingScheme({
                        numberOfLevelZeroTilesX: 2,
                        numberOfLevelZeroTilesY: 1,
                    });
                    _this.providers = [
                        new EPSG4326MapImageryProvider_1.EPSG4326MapImageryProvider(),
                        new STKTerrainProvider_1.STKTerrainProvider(),
                    ];
                    _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 45, _this._tilingScheme.getNumberOfYTilesAtLevel(0));
                    return _this;
                }
                return STKTerrainScene;
            }(SceneMode_4.SceneMode));
            exports_50("STKTerrainScene", STKTerrainScene);
        }
    };
});
System.register("src/SceneMode/index", ["src/SceneMode/Scene2D", "src/SceneMode/TestScene", "src/SceneMode/BingMapScene", "src/SceneMode/STKTerrainScene"], function (exports_51, context_51) {
    "use strict";
    var __moduleName = context_51 && context_51.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_51(exports);
    }
    return {
        setters: [
            function (Scene2D_1_1) {
                exportStar_1(Scene2D_1_1);
            },
            function (TestScene_1_1) {
                exportStar_1(TestScene_1_1);
            },
            function (BingMapScene_1_1) {
                exportStar_1(BingMapScene_1_1);
            },
            function (STKTerrainScene_1_1) {
                exportStar_1(STKTerrainScene_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("src/index", ["src/Core/index", "src/SceneMode/index"], function (exports_52, context_52) {
    "use strict";
    var __moduleName = context_52 && context_52.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_52(exports);
    }
    return {
        setters: [
            function (Core_1_1) {
                exportStar_2(Core_1_1);
            },
            function (SceneMode_5_1) {
                exportStar_2(SceneMode_5_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("src/SceneMode/TerrainTile", ["three", "src/DataSource/DataSource", "src/DataSource/ImageDataLayer", "src/DataSource/TerrainRGBDataLayer", "src/SceneMode/Tile"], function (exports_53, context_53) {
    "use strict";
    var __moduleName = context_53 && context_53.id;
    var THREE, DataSource_8, ImageDataLayer_3, TerrainRGBDataLayer_1, Tile_4, image, TerrainTile;
    return {
        setters: [
            function (THREE_23) {
                THREE = THREE_23;
            },
            function (DataSource_8_1) {
                DataSource_8 = DataSource_8_1;
            },
            function (ImageDataLayer_3_1) {
                ImageDataLayer_3 = ImageDataLayer_3_1;
            },
            function (TerrainRGBDataLayer_1_1) {
                TerrainRGBDataLayer_1 = TerrainRGBDataLayer_1_1;
            },
            function (Tile_4_1) {
                Tile_4 = Tile_4_1;
            }
        ],
        execute: function () {
            image = new Image();
            TerrainTile = /** @class */ (function (_super) {
                __extends(TerrainTile, _super);
                function TerrainTile(options) {
                    var _this = _super.call(this, options) || this;
                    _this.data = new DataSource_8.DataSource({
                        layers: TerrainTile.dataLayers,
                        tile: _this,
                    });
                    return _this;
                }
                TerrainTile.createMesh = function () {
                    var material = new THREE.MeshBasicMaterial({
                        wireframe: true,
                        opacity: 0,
                    });
                    var geometry = new THREE.PlaneGeometry(1, 1);
                    geometry.rotateX(-Math.PI / 2);
                    return new THREE.Mesh(geometry, material);
                };
                TerrainTile.prototype.applyDataToMesh = function (mesh) {
                    var tileSize = Tile_4.Tile.size(this.z);
                    mesh.material = this.material;
                    mesh.scale.set(1, 1, 1);
                    mesh.geometry = this.geometry;
                };
                TerrainTile.prototype.dispose = function () {
                    _super.prototype.dispose.call(this);
                    if (this._geometry) {
                        this._geometry = undefined;
                    }
                    if (this._material) {
                        this._material = undefined;
                    }
                };
                Object.defineProperty(TerrainTile.prototype, "material", {
                    get: function () { return this._material; },
                    set: function (m) { this._material = m; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TerrainTile.prototype, "geometry", {
                    get: function () { return this._geometry; },
                    set: function (m) { this._geometry = m; },
                    enumerable: true,
                    configurable: true
                });
                TerrainTile.dataLayers = DataSource_8.DataSource.toLayers([ImageDataLayer_3.ImageDataLayer, TerrainRGBDataLayer_1.TerrainRGBDataLayer]);
                return TerrainTile;
            }(Tile_4.Tile));
            exports_53("TerrainTile", TerrainTile);
        }
    };
});
System.register("src/DataSource/TerrainRGBDataLayer", ["three", "src/SceneMode/Tile", "src/DataSource/DataSource", "src/DataSource/DataSourceLayer"], function (exports_54, context_54) {
    "use strict";
    var __moduleName = context_54 && context_54.id;
    var THREE, Tile_5, DataSource_9, DataSourceLayer_5, vertices, segments, imageSize, TerrainRGBDataLayer;
    return {
        setters: [
            function (THREE_24) {
                THREE = THREE_24;
            },
            function (Tile_5_1) {
                Tile_5 = Tile_5_1;
            },
            function (DataSource_9_1) {
                DataSource_9 = DataSource_9_1;
            },
            function (DataSourceLayer_5_1) {
                DataSourceLayer_5 = DataSourceLayer_5_1;
            }
        ],
        execute: function () {
            vertices = 256;
            segments = vertices - 1;
            imageSize = 256;
            TerrainRGBDataLayer = /** @class */ (function (_super) {
                __extends(TerrainRGBDataLayer, _super);
                function TerrainRGBDataLayer() {
                    return _super.call(this) || this;
                }
                TerrainRGBDataLayer.prototype.processLoading = function (tile) {
                    tile.data.status[TerrainRGBDataLayer.layerName] = DataSource_9.DataSource.State.Loading;
                };
                TerrainRGBDataLayer.prototype.processData = function (tile, data) {
                    var tileSize = Tile_5.Tile.size(tile.z);
                    tile.geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize, segments / 2, segments / 2);
                    var elevations = [];
                    for (var e = 0; e < data.length; e += 4) {
                        var R = data[e];
                        var G = data[e + 1];
                        var B = data[e + 2];
                        var i = e / 4;
                        var posX = (i % imageSize) - tileSize / 2;
                        var elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1);
                        var posZ = ((i - i % imageSize) / imageSize) - tileSize / 2;
                        // elevation *= 10;
                        elevations.push(posX, elevation, posZ);
                    }
                    // console.log(tile.geometry, elevations);
                    tile.geometry.attributes.position.array = new Float32Array(elevations);
                    tile.geometry.attributes.position.needsUpdate = true;
                    tile.data.status[TerrainRGBDataLayer.layerName] = DataSource_9.DataSource.State.Loaded;
                };
                TerrainRGBDataLayer.prototype.processError = function (tile, error) {
                    var elevations = [];
                    for (var e = 0; e < imageSize * imageSize; e++) {
                        var posX = (e % imageSize) - 127;
                        var posZ = (e / imageSize) - 127;
                        elevations.push(posX, 0, posZ);
                    }
                    tile.geometry = new THREE.PlaneBufferGeometry(vertices, vertices, segments, segments);
                    tile.geometry.attributes.position.array = new Float32Array(elevations);
                    tile.data.status[TerrainRGBDataLayer.layerName] = DataSource_9.DataSource.State.Idle;
                };
                TerrainRGBDataLayer.layerName = 'terrain';
                return TerrainRGBDataLayer;
            }(DataSourceLayer_5.DataSourceLayer));
            exports_54("TerrainRGBDataLayer", TerrainRGBDataLayer);
        }
    };
});
System.register("src/DataSource/TerrainRGBProvider", ["src/DataSource/Provider", "src/DataSource/TerrainRGBDataLayer"], function (exports_55, context_55) {
    "use strict";
    var __moduleName = context_55 && context_55.id;
    var Provider_5, TerrainRGBDataLayer_2, TerrainRGBProvider;
    return {
        setters: [
            function (Provider_5_1) {
                Provider_5 = Provider_5_1;
            },
            function (TerrainRGBDataLayer_2_1) {
                TerrainRGBDataLayer_2 = TerrainRGBDataLayer_2_1;
            }
        ],
        execute: function () {
            TerrainRGBProvider = /** @class */ (function (_super) {
                __extends(TerrainRGBProvider, _super);
                function TerrainRGBProvider(options) {
                    var _this = _super.call(this, options) || this;
                    _this.context2d = options.context2d;
                    return _this;
                }
                TerrainRGBProvider.prototype.url = function (x, y, z) {
                    var serverIndex = 2 * (x % 2) + y % 2;
                    var server = ['a', 'b', 'c', 'd'][serverIndex];
                    return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + z + '/' + x + '/' + y +
                        '.pngraw?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
                };
                TerrainRGBProvider.prototype.loadTile = function (tile) {
                    if (this._loading >= this._maxLoad) {
                        return;
                    }
                    if (tile.data.isLoading(TerrainRGBDataLayer_2.TerrainRGBDataLayer.layerName)) {
                        return;
                    }
                    var scope = this;
                    if (typeof Qt === 'object') {
                        var url_1 = this.url(tile.x, tile.y, tile.z);
                        var loaded_1 = function () {
                            if (tile.stringify !== this.stringify) {
                                return;
                            }
                            canvas2d.imageLoaded.disconnect(loaded_1);
                            scope.context2d.drawImage(url_1, 0, 0);
                            var pixels = scope.context2d.getImageData(0, 0, 256, 256);
                            tile.data.loaded(TerrainRGBDataLayer_2.TerrainRGBDataLayer.layerName, pixels.data);
                            scope._needUpdate = true;
                            scope._loading--;
                        }.bind(tile);
                        canvas2d.loadImage(url_1);
                        canvas2d.imageLoaded.connect(loaded_1);
                    }
                    else {
                        var data_1 = new Image();
                        data_1.crossOrigin = 'Anonymous';
                        data_1.addEventListener('load', function () {
                            scope.context2d.drawImage(data_1, 0, 0);
                            var pixels = scope.context2d.getImageData(0, 0, data_1.width, data_1.height);
                            tile.data.loaded(TerrainRGBDataLayer_2.TerrainRGBDataLayer.layerName, pixels.data);
                            scope._needUpdate = true;
                            scope._loading--;
                        });
                        data_1.addEventListener('error', function (err) {
                            if (err) {
                                tile.data.failed(TerrainRGBDataLayer_2.TerrainRGBDataLayer.layerName, err);
                                scope._needUpdate = true;
                                scope._loading--;
                                // console.error('Error loading terrain ' + tile.stringify);
                            }
                        });
                        data_1.src = this.url(tile.x, tile.y, tile.z);
                    }
                    tile.data.loading(TerrainRGBDataLayer_2.TerrainRGBDataLayer.layerName);
                };
                return TerrainRGBProvider;
            }(Provider_5.Provider));
            exports_55("TerrainRGBProvider", TerrainRGBProvider);
        }
    };
});
System.register("src/SceneMode/TerrainScene", ["src/Core/TilingScheme", "src/DataSource/ImageryProvider", "src/DataSource/TerrainRGBProvider", "src/SceneMode/SceneMode", "src/SceneMode/TerrainTile"], function (exports_56, context_56) {
    "use strict";
    var __moduleName = context_56 && context_56.id;
    function getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
    }
    var TilingScheme_5, ImageryProvider_3, TerrainRGBProvider_1, SceneMode_6, TerrainTile_1, TerrainScene;
    return {
        setters: [
            function (TilingScheme_5_1) {
                TilingScheme_5 = TilingScheme_5_1;
            },
            function (ImageryProvider_3_1) {
                ImageryProvider_3 = ImageryProvider_3_1;
            },
            function (TerrainRGBProvider_1_1) {
                TerrainRGBProvider_1 = TerrainRGBProvider_1_1;
            },
            function (SceneMode_6_1) {
                SceneMode_6 = SceneMode_6_1;
            },
            function (TerrainTile_1_1) {
                TerrainTile_1 = TerrainTile_1_1;
            }
        ],
        execute: function () {
            TerrainScene = /** @class */ (function (_super) {
                __extends(TerrainScene, _super);
                function TerrainScene(context2d) {
                    var _this = _super.call(this, {
                        instance: TerrainTile_1.TerrainTile,
                    }) || this;
                    _this._tilingScheme = new TilingScheme_5.TilingScheme({
                        numberOfLevelZeroTilesX: 1,
                        numberOfLevelZeroTilesY: 1,
                    });
                    _this.providers = [
                        new ImageryProvider_3.ImageryProvider(),
                        new TerrainRGBProvider_1.TerrainRGBProvider({ context2d: context2d }),
                    ];
                    _this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(_this._tilingScheme.ellipsoid, 65, _this._tilingScheme.getNumberOfXTilesAtLevel(0));
                    return _this;
                }
                return TerrainScene;
            }(SceneMode_6.SceneMode));
            exports_56("TerrainScene", TerrainScene);
        }
    };
});
System.register("src/Utility/GeometricHelper", [], function (exports_57, context_57) {
    "use strict";
    var __moduleName = context_57 && context_57.id;
    function between(a, b, c) {
        return a - eps <= b && b <= c + eps;
    }
    var eps, GeometricHelper;
    return {
        setters: [],
        execute: function () {
            eps = 0.0000001;
            GeometricHelper = /** @class */ (function () {
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
            exports_57("GeometricHelper", GeometricHelper);
        }
    };
});
//# sourceMappingURL=index.js.map