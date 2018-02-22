Qt.include('/three.js')
Qt.include('/Core/MapSettings.js')

function AABB(options) {
    options = options ||  {};
    this.xMin = options.xMin || 0;
    this.yMin = options.yMin || 0;
    this.zMin = options.zMin || 0;
    this.xMax = options.xMax || 0;
    this.yMax = options.yMax || 0;
    this.zMax = options.zMax || 0;
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

AABB.prototype.distanceFromPoint = function(vector) {
    var dx = Math.max(this.xMin - vector.x, Math.max(0, vector.x - this.xMax));
    var dy = Math.max(this.yMin - vector.y, Math.max(0, vector.y - this.yMax));
    var dz = Math.max(this.zMin - vector.z, Math.max(0, vector.z - this.zMax));
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

AABB.createAABBForTile = function(tile) {
    var tileSize = MapSettings.basePlaneDimension / Math.pow(2, tile.z);
    var xMin = (tile.x) * tileSize - MapSettings.basePlaneDimension / 2;
    var xMax = (tile.x + 1) * tileSize - MapSettings.basePlaneDimension / 2;
    var zMin = (tile.y) * tileSize - MapSettings.basePlaneDimension / 2;
    var zMax = (tile.y + 1) * tileSize - MapSettings.basePlaneDimension / 2;
    return new AABB({
        xMin: xMin,
        xMax: xMax,
        yMin: 0,
        yMax: 10,
        zMin: zMin,
        zMax: zMax
    });
}
