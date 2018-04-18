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

TerrainGenerator.imageSize = 256;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {string} - Url
 */
TerrainGenerator.prototype.url = function (x, y, z) {
    var serverIndex = 2 * (x % 2) + y % 2;
    var server = ['a', 'b', 'c', 'd'][serverIndex];
    return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + z + '/' + x + '/' + y +
        '.pngraw?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
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

/**
*
* @param {Tile} tile
*/
TerrainGenerator.prototype.loadTile = function (tile) {
    if (this._loadingThisTick <= 0) return;
    // TODO: status inside tile, remove import DataSrouce
    if (tile.data.isLoading('terrain')) return;

    var scope = this;
    this._loadingThisTick--;
    this._loading++;

    if (tile.stringify !== '0/0/0') return;

    if (typeof Qt === 'object') {
        var url = this.url(tile.x, tile.y, tile.z);
        var loaded = function () {
            if (tile.stringify !== this.stringify) {
                return;
            }
            canvas2d.imageLoaded.disconnect(loaded);

            scope.context2d.drawImage(url, 0, 0);
            var pixels = scope.context2d.getImageData(0, 0, 256, 256);

            tile.data.loaded('terrain', pixels.data);

            scope._needUpdate = true;
            scope._loading--;
        }.bind(tile);
        canvas2d.loadImage(url);
        canvas2d.imageLoaded.connect(loaded);
    } else {
        var data = new Image();
        data.crossOrigin = 'Anonymous';
        data.addEventListener('load', function () {
            scope.context2d.drawImage(data, 0, 0);
            var pixels = scope.context2d.getImageData(0, 0, data.width, data.height);

            tile.data.loaded('terrain', pixels.data);

            scope._needUpdate = true;
            scope._loading--;
        });
        data.addEventListener('error', function (err) {
            if (err) {
                tile.data.failed('terrain', err);

                scope._needUpdate = true;
                scope._loading--;
                // console.error('Error loading terrain ' + tile.stringify);
            }
        });
        data.src = this.url(tile.x, tile.y, tile.z);
    }

    tile.data.loading('terrain');
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
