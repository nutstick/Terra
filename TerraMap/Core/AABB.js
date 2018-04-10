var Cartesian = require('../Math/Cartesian');

var UNIT_Y = { x: 0.0, y: 1.0, z: 0.0 };
var t = [[0, 0], [0, 1], [1, 1], [1, 0]];
/**
 * AABB class
 * @alias AABB
 * @constructor
 *
 * @param {Object} options - Option
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {number} zMin
 * @param {number} zMax
 */
function AABB (options) {
    options = options || {};
    this.xMin = options.xMin || 0;
    this.yMin = options.yMin || 0;
    this.zMin = options.zMin || 0;
    this.xMax = options.xMax || 0;
    this.yMax = options.yMax || 0;
    this.zMax = options.zMax || 0;

    // /**
    //  * @type Tile
    //  * @private
    //  */
    // this._tile = options.tile;

    // Compute the normal of the plane on the western edge of the tile.
    var midPoint = new THREE.Vector3();
    midPoint.x = (this.xMax + this.xMin) / 2;
    midPoint.z = (this.zMax + this.zMin) / 2;

    var temp2 = new THREE.Vector3();

    var westernMidpointCartesian = new THREE.Vector3();
    westernMidpointCartesian.x = (this.xMax + this.xMin) / 2;
    westernMidpointCartesian.z = this.zMin;

    this.westNormal = new THREE.Vector3();
    this.westNormal.crossVectors(temp2.subVectors(midPoint, westernMidpointCartesian), UNIT_Y);
    this.westNormal.normalize();

    var easternMidpointCartesian = new THREE.Vector3();
    easternMidpointCartesian.x = (this.xMax + this.xMin) / 2;
    easternMidpointCartesian.z = this.zMax;

    this.eastNormal = new THREE.Vector3();
    this.eastNormal.crossVectors(temp2.subVectors(midPoint, easternMidpointCartesian), UNIT_Y);
    this.eastNormal.normalize();

    var northMidpointCartesian = new THREE.Vector3();
    northMidpointCartesian.x = this.xMin;
    northMidpointCartesian.z = (this.zMax + this.zMin) / 2;

    this.northNormal = new THREE.Vector3();
    this.northNormal.crossVectors(temp2.subVectors(midPoint, northMidpointCartesian), UNIT_Y);
    this.northNormal.normalize();

    var southMidpointCartesian = new THREE.Vector3();
    southMidpointCartesian.x = this.xMax;
    southMidpointCartesian.z = (this.zMax + this.zMin) / 2;

    this.southNormal = new THREE.Vector3();
    this.southNormal.crossVectors(temp2.subVectors(midPoint, southMidpointCartesian), UNIT_Y);
    this.southNormal.normalize();

    this.northwestCornnerCartesian = new THREE.Vector3(this.xMin, 0, this.zMin);
    this.southeastCornnerCartesian = new THREE.Vector3(this.xMax, 0, this.zMax);

    this._corner = new Array(4);
    for (var i = 0; i < 4; ++i) {
        // TODO: y
        this._corner[i] = new Cartesian({
            x: t[i][0] ? this.xMin : this.xMax,
            y: 0,
            z: t[i][1] ? this.zMin : this.zMax
        });
    };
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

/**
 * @param {Camera} camera
 */
var cameraCartesianPosition = new Cartesian();
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
        } else if (distanceToEastPlane > 0.0) {
            result += distanceToEastPlane * distanceToEastPlane;
        }

        if (distanceToSouthPlane > 0.0) {
            result += distanceToSouthPlane * distanceToSouthPlane;
        } else if (distanceToNorthPlane > 0.0) {
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

Object.defineProperties(AABB.prototype, {
    center: {
        get: function () {
            return new Cartesian({
                x: (this.xMin + this.xMax) / 2,
                y: (this.yMin + this.yMax) / 2,
                z: (this.zMin + this.zMax) / 2
            });
        }
    },
    corner: {
        get: function () {
            return this._corner;
        }
    }
});

module.exports = AABB;
