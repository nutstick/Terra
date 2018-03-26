var MapSettings = require('./MapSettings');
var MapUtility = require('../Utility/MapUtility');
var sphericalMercator = require('../Utility/SphericalMercator');

var UNIT_Z = THREE.Vector3(0.0, 0.0, 1.0);

function AABB(options) {
    options = options ||  {};
    this.xMin = options.xMin || 0;
    this.yMin = options.yMin || 0;
    this.zMin = options.zMin || 0;
    this.xMax = options.xMax || 0;
    this.yMax = options.yMax || 0;
    this.zMax = options.zMax || 0;

    // Compute the normal of the plane on the western edge of the tile.
    var westernMidpointCartesian = new THREE.Vector3();
    westernMidpointCartesian.x = (this.xMax + this.xMin) / 2;
    westernMidpointCartesian.y = this.yMin;
    
    this.westNormal = new THREE.Vector3();
    westNormal.crossVectors(westernMidpointCartesian, UNIT_Z);
    westNormal.normalize();

    var easternMidpointCartesian = new THREE.Vector3();
    easternMidpointCartesian.x = (this.xMax + this.xMin) / 2;
    easternMidpointCartesian.y = this.yMax;

    this.eastNormal = new THREE.Vector3();
    eastNormal.crossVectors(easternMidpointCartesian, UNIT_Z);
    eastNormal.normalize();

    var northMidpointCartesian = new THREE.Vector3();
    northMidpointCartesian.x = this.xMin;
    northMidpointCartesian.y = (this.yMax + this.yMin) / 2;

    this.northNormal = new THREE.Vector3();
    northNormal.crossVectors(northMidpointCartesian, UNIT_Z);
    northNormal.normalize();

    var southMidpointCartesian = new THREE.Vector3();
    southMidpointCartesian.x = this.xMax;
    southMidpointCartesian.y = (this.yMax + this.yMin) / 2;

    this.southhNormal = new THREE.Vector3();
    southhNormal.crossVectors(southMidpointCartesian, UNIT_Z);
    southhNormal.normalize();

    this.northwestCornnerCartesian = new THREE.Vector3(xMin, yMin);
    this.southeastCornnerCartesian = new THREE.Vector3(xMax, yMax);
}

Object.defineProperties(AABB.prototype, {
    xCenter: {
        get: function() {
            return (this.xMax + this.xMin) / 2;
        }
    },
    yCenter: {
        get: function() {
            return (this.yMax + this.yMin) / 2;
        }
    },
    zCenter: {
        get: function() {
            return (this.zMax + this.zMin) / 2;
        }
    },
    center: {
        get: function() {
            return THREE.Vector2(this.xCenter, this.yCenter, this.zCenter);
        }
    }
})

AABB.prototype.intersects = function(x, y, z) {
    if (x instanceof AABB) {
        var other = x;

        return this.xMin < other.xMax && other.xMin < this.xMax &&
            this.yMin < other.yMax && other.yMin < this.yMax &&
            this.zMin < other.zMax && other.zMin < this.zMax;
    }
    return this.xMin <= x && this.xMax >= x &&
        this.yMin <= y && this.yMax >= y &&
        this.zMin <= z && this.zMax >= z;
}

var temp = THREE.Vector3();
var temp2 = THREE.Vector3();

/**
 * @param {Camera} camera 
 */
AABB.prototype.distanceToCamera = function(camera) {
    var cameraCartesianPosition = camera.positionCartesian;
    var cameraCartographicPosition = camera.positionCartographic;

    var result = 0.0;
    if (!this.intersects(cameraCartesianPosition.x, cameraCartesianPosition.y, cameraCartesianPosition.z)) {
        var northwestCornnerCartesian = this.northwestCornnerCartesian;
        var southeastCornnerCartesian = this.southeastCornnerCartesian;
        var westNormal = this.westNormal;
        var southNormal = this.southNormal;
        var eastNormal = this.eastNormal;
        var northNormal = this.northNormal;

        var vectorFromNorthwestCorner = temp.subVectors(cameraCartesianPosition, northwestCornnerCartesian);
        var distanceToWestPlane = vectorFromNorthwestCorner.dot(westNormal);
        var distanceToNorthPlane = vectorFromNorthwestCorner.dot(northNormal);

        var vectorFromSoutheastCorner = temp.subVectors(cameraCartesianPosition, southeastCornnerCartesian);
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

    var cameraHeight = cameraCartographicPosition.altitude;

    var distanceFromTop = cameraHeight;
    if (distanceFromTop > 0.0) {
        result += distanceFromTop * distanceFromTop;
    }

    return Math.sqrt(result);
}

AABB.prototype.distanceFromPoint = function(vector) {
    var dx = Math.max(this.xMin - vector.x, vector.x - this.xMax);
    var dy = Math.max(this.yMin - vector.y, vector.y - this.yMax);
    var dz = Math.max(this.zMin - vector.z, vector.z - this.zMax);
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

AABB.createAABBForTile = function(tile) {
    var tileSize = MapSettings.basePlaneDimension / Math.pow(2, tile.z);
    var xMin = (tile.x) * tileSize - MapSettings.basePlaneDimension / 2;
    var xMax = (tile.x + 1) * tileSize - MapSettings.basePlaneDimension / 2;
    var zMin = (tile.y) * tileSize - MapSettings.basePlaneDimension / 2;
    var zMax = (tile.y + 1) * tileSize - MapSettings.basePlaneDimension / 2;

    var topLeftCornner = sphericalMercator.PixelToCartesian(new THREE.Vector3(xMin, 0, zMin));
    var bottomRightCornner = sphericalMercator.PixelToCartesian(new THREE.Vector3(xMax, 0, zMax));

    return new AABB({
        xMin: topLeftCornner.x,
        xMax: bottomRightCornner.x,
        yMin: topLeftCornner.y,
        yMax: bottomRightCornner.y,
        zMin: 0,
        zMax: 10
    });
}

module.exports = AABB;