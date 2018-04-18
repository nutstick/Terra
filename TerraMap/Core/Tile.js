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
        throw new Error('No options provided');
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

Tile.prototype.applyDataToMesh = function (mesh) {
    throw new Error('Abtstract');
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

            var Instance = this.constructor;

            for (var i = 0; i < 4; ++i) {
                if (typeof this._children[i] === 'undefined') {
                    this._children[i] = new Instance({
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
            throw new Error('derpercate');
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
            return this.data.needsLoading;
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
            return this.data.done;
        }
    },
    // FIXME:
    eligibleForUnloading: {
        get: function () {
            return true;
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

    this.data.dispose();

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
