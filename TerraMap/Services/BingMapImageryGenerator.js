/**
 * TextureGenerator Class
 * @alias TextureGenerator
 * @constructor
 * @param {Object} options
 * @param {QuadTree} options.quadTree - QuadTree
 * @param {number} [options.maxLoad=50] - Max loading thread
 */
function BingMapImageryGenerator (options) {
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
 * Converts a tiles (x, y, level) position into a quadkey used to request an image
 * from a Bing Maps server.
 *
 * @param {Number} x The tile's x coordinate.
 * @param {Number} y The tile's y coordinate.
 * @param {Number} level The tile's zoom level.
 */
BingMapImageryGenerator.tileXYToQuadKey = function (x, y, level) {
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
/**
 * Converts a tile's quadkey used to request an image from a Bing Maps server into the
 * (x, y, level) position.
 *
 * @param {String} quadkey The tile's quad key
 */
BingMapImageryGenerator.quadKeyToTileXY = function (quadkey) {
    var x = 0;
    var y = 0;
    var level = quadkey.length - 1;
    for (var i = level; i >= 0; --i) {
        var bitmask = 1 << i;
        var digit = +quadkey[level - i];

        if ((digit & 1) !== 0) {
            x |= bitmask;
        }

        if ((digit & 2) !== 0) {
            y |= bitmask;
        }
    }
    return {
        x: x,
        y: y,
        level: level
    };
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {string} - Url
 */
function url (generator, x, y, z) {
    var url = generator._baseUrl;
    var subdomains = generator._subdomains;
    var subdomainIndex = (x + y + z) % subdomains.length;

    var replaceParameters = {
        subdomain: subdomains[subdomainIndex],
        quadkey: generator.tileXYToQuadKey(x, y, z)
    };

    var keys = Object.keys(replaceParameters);
    if (keys.length > 0) {
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = replaceParameters[key];
            url = url.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
        }
    }

    console.log(url)
    return url;
};

var key = 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';

BingMapImageryGenerator.prototype.start = function () {
    var scope = this;
    var meta = new XMLHttpRequest();
    meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);
    meta.crossOrigin = 'Anonymous';
    meta.addEventListener('load', function () {
        var response = JSON.parse(meta.response);

        var resourcs = response.resourceSets[0].resources[0];
        scope._baseUrl = resourcs.imageUrl;
        scope._subdomains = resourcs.imageUrlSubdomains;
        scope._zoomMax = resourcs.zoomMax - 1;
        scope._zoomMin = resourcs.zoomMin;
        // Start service
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
    });
    meta.send(null);

    meta.addEventListener('error', function (err) {
        if (err) {
            throw new Error('Error when retreieve meta data of bing aerail');
        }
    });
};

/**
 *
 * @param {Tile} tile
 */
BingMapImageryGenerator.prototype.loadTile = function (tile) {
    if (this._loadingThisTick <= 0) return;
    // TODO: status inside tile, remove import DataSrouce
    if (tile.data.isLoading('texture')) return;

    var scope = this;
    this._loadingThisTick--;
    this._loading++;

    var texture = new THREE.TextureLoader()
        .load(
            url(this, tile._x, tile._y, tile._z),
            function (resp) {
                scope._needUpdate = true;
                tile.data.loaded('texture', texture);
                scope._loading--;
            },
            function () {},
            function (err) {
                if (err) {
                    tile.data.fail('texture', err);
                    scope._loading--;
                    console.error('Error loading texture' + tile.stringify);
                }
            }
        );

    tile.data.loading('texture');
};

BingMapImageryGenerator.prototype.load = function () {
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

module.exports = BingMapImageryGenerator;
