var AABB = require('./AABB');
var MapSettings = require('./MapSettings');

/**
 * Tile
 * @alias Tile
 * @constructor
 *
 * @param {Object} options
 * @param {number} options.x - x
 * @param {number} options.y - y
 * @param {number} options.z - z
 * @param {QuadTree} options.quadTree - QuadTree
 * @param {Tile} options.parent - Parent
 */
function Tile (options) {
    if (!options) {
        throw new Error('No option provided');
    }

    if (typeof options.x === 'undefined') throw new Error('No options.x provided');
    this._x = options.x;
    if (typeof options.y === 'undefined') throw new Error('No options.y provided');
    this._y = options.y;
    if (typeof options.z === 'undefined') throw new Error('No options.z provided');
    this._z = options.z;
    if (typeof options.quadTree === 'undefined') throw new Error('No options.quadTree provided');
    /**
     * @type {QuadTree}
     * @private
     */
    this._quadTree = options.quadTree;

    /**
     * @type {Tile}
     * @private
     */
    // QuadTreeTile structure
    this._parent = options.parent;

    // State
    this._state = Tile.TileState.Start;

    this.data = {
        texture: undefined,
        // TODO: terrain loading
        // terrain: undefined
    };

    // QuadtreeTileReplacementQueue gets/sets these private properties.
    /**
     * @type {Tile}
     * @private
     */
    this._replacementPrevious = undefined;

    /**
     * @type {Tile}
     * @private
     */
    this._replacementNext = undefined;

    /**
     * @type {number}
     * @private
     */
    this._distance = undefined;

    /**
     * @type {AABB}
     * @private
     */
    this._bbox = undefined;

    this.upsampledFromParent = false;
}

Tile.TileState = {
    Start: 0,
    Loading: 1,
    Done: 2,
    Failed: 3
};

var size = Array.apply(null, Array(32)).map(function (_, idx) {
    return MapSettings.basePlaneDimension / Math.pow(2, idx);
});

Tile.size = function (z) {
    return size[z];
};

Tile.pool = Array.apply(null, Array(120)).map(function (_, idx) {
    var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        opacity: 0
    });

    var geometry = new THREE.Geometry();
    geometry.vertices = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ];
    geometry.faces = [
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(0, 3, 2),
    ];
    geometry.computeFaceNormals();

    return new THREE.Mesh(geometry, material);
});

/**
 *
 * @param {QuadTree} quadTree
 * @param {TilingScheme} tilingScheme
 * @return {Tile[]}
 */
Tile.createRootTile = function (quadTree, tilingScheme) {
    if (!tilingScheme) {
        throw new Error('No tiling scheme provided');
    }

    var numberOfLevelZeroTilesX = tilingScheme.getNumberOfXTilesAtLevel(0);
    var numberOfLevelZeroTilesY = tilingScheme.getNumberOfYTilesAtLevel(0);

    var result = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);

    var index = 0;
    for (var y = 0; y < numberOfLevelZeroTilesY; ++y) {
        for (var x = 0; x < numberOfLevelZeroTilesX; ++x) {
            result[index++] = new Tile({
                x: x,
                y: y,
                z: 0,
                quadTree: quadTree
            });
        }
    }

    return result;
};

Tile.prototype.imageryLoading = function (layerName, texture) {
    if (this._state === Tile.TileState.Failed) return;

    this.data[layerName] = texture;

    this._state = Tile.TileState.Loading;
};

Tile.prototype.imageryDone = function (layerName) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== Tile.TileState.Loading) return;

    var isDone = Object.keys(this.data).reduce(function (prev, key) {
        return prev && !this.data[key].loading;
    }.bind(this), true);

    if (isDone) {
        this._state = Tile.TileState.Done;

        // Trigger need update
        this._quadTree.needUpdate = true;
    }
};

Tile.prototype.imageryFailed = function (layerName) {
    this._state = Tile.TileState.Start;
};

Object.defineProperties(Tile.prototype, {
    x: {
        get: function () {
            return this._x;
        }
    },
    y: {
        get: function () {
            return this._y;
        }
    },
    z: {
        get: function () {
            return this._z;
        }
    },
    parent: {
        get: function () {
            return this._parent;
        }
    },
    /**
     * @memberof Tile.prototype
     * @type {Tile[]}
     */
    children: {
        get: function () {
            if (typeof this._children === 'undefined') {
                this._children = new Array(4);
            }

            for (var i = 0; i < 4; ++i) {
                if (typeof this._children[i] === 'undefined') {
                    this._children[i] = new Tile({
                        x: this._x * 2 + i % 2,
                        // Rounding float to integer ex. ~~2.5 = 2
                        y: this._y * 2 + (~~(i / 2)) % 2,
                        z: this._z + 1,
                        parent: this,
                        quadTree: this._quadTree
                    });
                }
            }

            return this._children;
        }
    },

    /**
     * Previous Tile in Replacement Queue
     * @memberof Tile.prototype
     *
     * @type {Tile}
     */
    replacementPrevious: {
        get: function () {
            return this._replacementPrevious;
        },
        set: function (tile) {
            this._replacementPrevious = tile;
        }
    },

    /**
     * Next Tile in Replacement Queue
     * @memberof Tile.prototype
     *
     * @type {Tile}
     */
    replacementNext: {
        get: function () {
            return this._replacementNext;
        },
        set: function (tile) {
            this._replacementNext = tile;
        }
    },
    /**
     * Distance from camera
     * @memberof Tile.prototype
     *
     * @type {number}
     */
    distance: {
        get: function () {
            return this._distance;
        },
        set: function (distance) {
            this._distance = distance;
        }
    },
    bbox: {
        get: function () {
            if (!this._bbox) {
                var tileSize = Tile.size(this.z);
                var xMin = (this.x) * tileSize - MapSettings.basePlaneDimension / 2;
                var xMax = (this.x + 1) * tileSize - MapSettings.basePlaneDimension / 2;
                var zMin = (this.y) * tileSize - MapSettings.basePlaneDimension / 2;
                var zMax = (this.y + 1) * tileSize - MapSettings.basePlaneDimension / 2;

                // TODO: height as 10 meters
                this._bbox = new AABB({
                    xMin: xMin,
                    xMax: xMax,
                    yMin: 0,
                    yMax: 0,
                    zMin: zMin,
                    zMax: zMax
                });
            }

            return this._bbox;
        }
    },

    /************************
     * State handling
     ***********************/

    /**
     * Tile State
     * @memberof Tile.prototype
     *
     * @type {number}
     */
    state: {
        get: function () {
            return this._state;
        }
    },
    /**
     * Tile need loading flags
     * @memberof Tile.prototype
     *
     * @type {boolean}
     */
    needsLoading: {
        get: function () {
            return this._state < Tile.TileState.Loading;
        }
    },
    /**
     * Tile is renderable flags
     * @memberof Tile.prototype
     *
     * @type {boolean}
     */
    renderable: {
        get: function () {
            return this._state >= Tile.TileState.Done;
        }
    },
    // FIXME:
    eligibleForUnloading: {
        get: function () {
            return true;
        }
    },

    /************************
     * THREE.js rendering
     ***********************/
    material: {
        get: function () {
            if (!this.data.texture) throw new Error('Material request before texture loaded');
            return new THREE.MeshBasicMaterial({
                map: this.data.texture
            });
        }
    },

    stringify: {
        get: function () {
            return this._x + '/' + this._y + '/' + this._z;
        }
    }
});

Tile.prototype.freeResources = function () {
    // Remove link betweem parent
    if (this._parent) {
        for (var i = 0; i < 4; i++) {
            if (this._parent._children[i] && this.stringify === this._parent._children[i].stringify) {
                this._parent._children[i] = undefined;
            }
        }
    }
    this._parent = undefined;

    this._state = Tile.TileState.Start;

    this._bbox = undefined;

    this.upsampledFromParent = false;
    if (this.data.texture) {
        this.data.texture.dispose();
    }
    this.data = {};

    if (this._children) {
        for (var j = 0; j < 4; ++j) {
            if (this._children[j]) {
                this._children[j].freeResources();
                this._children[j] = undefined;
            }
        }
    }

    this._quadTree = undefined;
};

module.exports = Tile;
