/**
 * TextureGenerator Class
 * @alias TextureGenerator
 * @constructor
 * @param {Object} options
 * @param {QuadTree} options.quadTree - QuadTree
 * @param {number} [options.maxLoad=50] - Max loading thread
 */
function DebugGenerator (options) {
    if (!options) throw new Error('No options provided');

    if (!options.quadTree) throw new Error('No options.quadTree provided');
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

DebugGenerator.prototype.start = function () {
    var scope = this;
    // TIMER: timer.
    if (typeof Qt === 'object') {
        timer.setInterval(function () {
            scope.load();
            if (scope._needUpdate) {
                scope._quadTree.update();
                scope._needUpdate = false;
            }
        }, 500);
    } else {
        setInterval(function () {
            scope.load();
            if (scope._needUpdate) {
                scope._quadTree.update();
                scope._needUpdate = false;
            }
        }, 10);
    }
};

/**
 *
 * @param {Tile} tile
 */
DebugGenerator.prototype.loadTile = function (tile) {
    if (this._loadingThisTick <= 0) return;
    if (!tile.needsLoading) return;

    this._loadingThisTick--;
    this._loading++;

    tile.imageryLoading();
    this._needUpdate = true;
    tile.imageryDone();
    this._loading--;
};

DebugGenerator.prototype.load = function () {
    // Print out debug
    // updateLoadingProgress(this);

    this._loadingThisTick = this._maxLoad - this._loading;
    for (var i = 0; i < this._quadTree._tileLoadQueueHigh.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueHigh[i]);
    }
    for (var i = 0; i < this._quadTree._tileLoadQueueMedium.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueMedium[i]);
    }
    for (var i = 0; i < this._quadTree._tileLoadQueueLow.length && this._loadingThisTick; ++i) {
        this.loadTile(this._quadTree._tileLoadQueueLow[i]);
    }
};

function updateLoadingProgress (textureGenerator) {
    var debug = textureGenerator.debug;
    debug.high = textureGenerator._quadTree._tileLoadQueueHigh.length;
    debug.medium = textureGenerator._quadTree._tileLoadQueueMedium.length;
    debug.low = textureGenerator._quadTree._tileLoadQueueLow.length;

    if (debug.high !== debug.lastHigh ||
        debug.medium !== debug.lastMedium ||
        debug.low !== debug.lastLow) {
        console.log('Loading High: ' + debug.high + ', Medium: ' + debug.medium + ', Low: ' + debug.low);
        debug.lastHigh = debug.high;
        debug.lastMedium = debug.medium;
        debug.lastLow = debug.low;
    }
}

module.exports = DebugGenerator;
