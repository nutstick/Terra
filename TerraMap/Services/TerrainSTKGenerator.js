var c = require('../Utility/Conversion');

/**
 * TextureGenerator Class
 * @alias TerrainGenerator
 * @constructor
 * @param {Object} options
 * @param {QuadTree} options.quadTree - QuadTree
 * @param {number} [options.maxLoad=50] - Max loading thread
 */
function TerrainGenerator (options) {
    if (!options) throw new Error('No options provided');

    if (!options.quadTree) throw new Error('No options.quadTree provided');

    this.context2d = options.quadTree._map.context2d;
    this._quadTree = options.quadTree;
    this._maxLoad = options.maxLoad || 50;

    this._loading = 0;
    this._loadingThisTick = 0;

    this.debug = {
        high: 0,
        medium: 0,
        low: 0,
        lastHigh: 0,
        lastMedium: 0,
        lastLow: 0
    };

    this._needUpdate = false;

    this.start();
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {string} - Url
 */
TerrainGenerator.prototype.url = function (x, y, z) {
    return 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/' + z + '/' + y + '/' + x + '.terrain';
};

TerrainGenerator.prototype.start = function () {
    var scope = this;
    // TIMER: timer.
    if (typeof Qt === 'object') {
        timer.setInterval(function () {
            scope.load();
            if (scope._needUpdate) {
                scope._quadTree.update();
                scope._needUpdate = false;
            }
        }, 200);
    } else {
        setInterval(function () {
            scope.load();
            if (scope._needUpdate) {
                scope._quadTree.update();
                scope._needUpdate = false;
            }
        }, 200);
    }
};

function getHeader (data, byteCount) {
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
        horizonOcclusionPointZ: c.getFloat64(data, byteCount + 80)
    };
}

function parseTile (data) {
    let byteCount = 0;

    let header = getHeader(data, byteCount);
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

    let indexArray = c.highwaterDecode(indices);
    return [header, uArray, vArray, heightArray, indexArray];
}

/**
*
* @param {Tile} tile
*/
TerrainGenerator.prototype.loadTile = function (tile) {
    if (this._loadingThisTick <= 0) return;
    if (tile.data.terrain) return;

    var scope = this;
    this._loadingThisTick--;
    this._loading++;

    // if (tile.stringify !== '0/0/0') return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url(tile.x, tile.y, tile.z), true);
    xhr.setRequestHeader('Accept', ' application/vnd.quantized-mesh,application/octet-stream;q=0.9');
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        if (this.response) {
            tile.imageryDone('terrain', parseTile(xhr.response));
            scope._needUpdate = true;
            scope._loading--;
        }
    };
    xhr.send(null);

    tile.imageryLoading('terrain');
};

TerrainGenerator.prototype.load = function () {
    // Print out debug
    // updateLoadingProgress(this);

    var i;

    this._loadingThisTick = this._maxLoad - this._loading;
    for (i = 0; i < this._quadTree._tileLoadQueueHigh.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueHigh[i]);
    }
    for (i = 0; i < this._quadTree._tileLoadQueueMedium.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueMedium[i]);
    }
    for (i = 0; i < this._quadTree._tileLoadQueueLow.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueLow[i]);
    }
};

// eslint-disable-next-line no-unused-vars
function updateLoadingProgress (textureGenerator) {
    var debug = textureGenerator.debug;
    debug.high = textureGenerator._quadTree._tileLoadQueueHigh.length;
    debug.medium = textureGenerator._quadTree._tileLoadQueueMedium.length;
    debug.low = textureGenerator._quadTree._tileLoadQueueLow.length;

    if (debug.high !== debug.lastHigh ||
        debug.medium !== debug.lastMedium ||
        debug.low !== debug.lastLow) {
        console.debug('Loading High: ' + debug.high + ', Medium: ' + debug.medium + ', Low: ' + debug.low);
        debug.lastHigh = debug.high;
        debug.lastMedium = debug.medium;
        debug.lastLow = debug.low;
    }
}

module.exports = TerrainGenerator;
