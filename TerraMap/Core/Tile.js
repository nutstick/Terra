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
    this._quadTree = options.quadTree;

    // QuadTreeTile structure
    this._parent = options.parent;
    this.TileState = {
        Start: 0,
        Loading: 1,
        Done: 2,
        Failed: 3
    };
    // State
    this._state = this.TileState.Start;

    this.data = {
        texture: undefined,
        // TODO: terrain loading
        // terrain: undefined
    };
    this._entity = undefined;

    // QuadtreeTileReplacementQueue gets/sets these private properties.
    this._replacementPrevious = undefined;
    this._replacementNext = undefined;

    /**
     * @type {number}
     * @private
     */
    this._distance = 0.0;

    /**
     * @type {AABB}
     * @private
     */
    this._bbox = undefined;

    this.upsampledFromParent = false;
}

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
    if (this._state === this.TileState.Failed) return;

    this.data[layerName] = texture;

    this._state = this.TileState.Loading;
};

Tile.prototype.imageryDone = function (layerName) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== this.TileState.Loading) return;

    var isDone = Object.keys(this.data).reduce(function (prev, key) {
        return prev && !this.data[key].loading;
    }.bind(this), true);

    if (isDone) {
        var tileSize = MapSettings.basePlaneDimension / (Math.pow(2, this._z));

        var material = this.material;

        var geometry = new THREE.PlaneGeometry(tileSize, tileSize);

        geometry.vertices = [
            new THREE.Vector3(-tileSize / 2, 0, -tileSize / 2),
            new THREE.Vector3(-tileSize / 2, 0, tileSize / 2),
            new THREE.Vector3(tileSize / 2, 0, -tileSize / 2),
            new THREE.Vector3(tileSize / 2, 0, tileSize / 2)
        ];
        geometry.faces = [
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(1, 3, 2)
        ];
        geometry.computeFaceNormals();

        var xOffset = (this._x + 0.5) * tileSize - MapSettings.basePlaneDimension / 2;
        var yOffset = (this._y + 0.5) * tileSize - MapSettings.basePlaneDimension / 2;

        geometry.translate(xOffset, 0, yOffset);

        this._entity = new THREE.Mesh(geometry, material);
        this._entity.tile = this;

        this._quadTree.tiles.add(this._entity);

        this._state = this.TileState.Done;

        this.active = false;

        // Trigger need update
        this._quadTree.needUpdate = true;
    }
};

Tile.prototype.imageryFailed = function (layerName) {
    this._state = this.TileState.Failed;
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
    children: {
        get: function () {
            if (typeof this._children === 'undefined') {
                this._children = new Array(4);
                this._children[0] = new Tile({
                    x: this._x * 2,
                    y: this._y * 2,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[1] = new Tile({
                    x: this._x * 2 + 1,
                    y: this._y * 2,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[2] = new Tile({
                    x: this._x * 2,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[3] = new Tile({
                    x: this._x * 2 + 1,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
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
     * @memberOf Tile.prototype
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
     * @memberOf Tile.prototype
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

    active: {
        get: function () {
            return this._entity.visible;
        },
        set: function (value) {
            this._entity.visible = value;
        }
    },
    /**
     * Distance from camera
     * @memberof {Tile.prototype}
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
                this._bbox = AABB.createAABBForTile(this);
            }
            return this._bbox;
        }
    },

    // State Handling
    /**
     * Tile State
     * @memberOf Tile
     */
    state: {
        get: function () {
            return this._state;
        }
    },
    needsLoading: {
        get: function () {
            return this._state < this.TileState.Loading;
        }
    },
    renderable: {
        get: function () {
            return this._state >= this.TileState.Done;
        }
    },
    eligibleForUnloading: {
        get: function () {
            return true;
        }
    },

    material: {
        get: function () {
            if (!this.data.texture) throw new Error('Material request before texture loaded');
            if (!this._material) {
                this._material = new THREE.MeshBasicMaterial({
                    map: this.data.texture,
                });
            }
            return this._material;
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

    this._state = this.TileState.Start;

    this.upsampledFromParent = false;
    if (this.data.texture) {
        this.data.texture.dispose();
    }
    this.data = {};

    // Remove entity from scene
    if (this._entity) {
        this._quadTree.tiles.remove(this._entity);
        this._entity.geometry.dispose();
        this._entity.material.dispose();
        this._entity = undefined;
    }

    if (this._children) {
        for (var j = 0; j < 4; ++j) {
            if (this._children[j]) {
                this._children[j].freeResources();
                this._children[j] = undefined;
            }
        }
    }
};

module.exports = Tile;