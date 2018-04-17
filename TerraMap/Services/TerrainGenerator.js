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
    if (tile.data.terrain) return;

    var scope = this;
    this._loadingThisTick--;
    this._loading++;

    // if (tile.stringify !== '0/0/0') return;

    var data = new Image()
    data.crossOrigin = "Anonymous"
    data.addEventListener('load', function() {
        if (typeof Qt === 'Object') {
            scope.context2d.drawImage(data._texImage, 0, 0)
        } else {
            scope.context2d.drawImage(data, 0, 0)
        }
        var pixels = scope.context2d.getImageData(0, 0, data.width, data.height)
        
        var elevations = [];
    
        for (var e = 0; e < pixels.data.length; e += 4){
            var R = pixels.data[e];
            var G = pixels.data[e+1];
            var B = pixels.data[e+2];
            
            var elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1);
            // elevation *= 10;
            elevations.push(e / 4 % 512 - 256, elevation, e / 4 / 512 - 256);
        }
        tile.imageryDone('terrain', new Float32Array(elevations));

        scope._needUpdate = true;
        scope._loading--;
    });
    data.addEventListener('error', function(err) {
        if (err) {
            var pixels = new Array(1048576).fill(0);
            
            var elevations = [];
        
            for (var e = 0; e < 512 * 512; e += 4){
                elevations.push(e / 4 % 512 - 256, 0, e / 4 / 512 - 256);
            }
            tile.imageryDone('terrain', new Float32Array(elevations));

            scope._needUpdate = true;
            scope._loading--;
            console.error('Error loading texture ' + tile.stringify);
        }
    });
    data.src = this.url(tile.x, tile.y, tile.z);

    tile.imageryLoading('terrain');
};

TerrainGenerator.prototype.load = function () {
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
        console.debug('Loading High: ' + debug.high + ', Medium: ' + debug.medium + ', Low: ' + debug.low);
        debug.lastHigh = debug.high;
        debug.lastMedium = debug.medium;
        debug.lastLow = debug.low;
    }
}

module.exports = TerrainGenerator;
