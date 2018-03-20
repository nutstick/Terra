Qt.include("three.js");
Qt.include("/Core/DeveloperError.js");
Qt.include("/Core/TileReplacementQueue.js");
Qt.include("/Core/MapSettings.js");
Qt.include("/Core/AABB.js");

var TileState = {
    Start: 0,
    Loading: 1,
    Done: 2,
    Failed: 3
};

/**
 * Tile
 * @alias Tile
 * @constructor
 * @param {Object} options
 * @param {number} options.x - x
 * @param {number} options.y - y
 * @param {number} options.z - z
 * @param {QuadTree} options.quadTree - QuadTree
 * @param {Tile} options.parent - Parent
 */
function Tile(options) {
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
    // State
    this._state = TileState.Start;

    this.data = {
        texture: undefined,
        // TODO: terrain loading
        // terrain: undefined
    };
    this._entity = undefined;

    // QuadtreeTileReplacementQueue gets/sets these private properties.
    this._replacementPrevious = undefined;
    this._replacementNext = undefined;

    this._distance = 0.0;
    this._bbox = undefined;

    this.upsampledFromParent = false;
}

/**
 * 
 * @param {QuadTree} quadTree 
 * @param {TilingScheme} tilingScheme
 * @return {Tile[]}
 */
Tile.createRootTile = function(quadTree, tilingScheme) {
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
                tilingScheme : tilingScheme,
                x: x,
                y: y,
                z: 0,
                quadTree: quadTree
            });
        }
    }

    return result;
}

Tile.prototype.imageryLoading = function(layerName, texture) {
    if (this._state === TileState.Failed) return;

    this.data[layerName] = texture;

    this._state = TileState.Loading;
}

Tile.prototype.imageryDone = function(layerName) {
    if (this._state === TileState.Failed) return;

    var isDone = Object.keys(this.data).reduce(function (prev, key) {
        return prev && !this.data[key].loading;
    }.bind(this), true)

    if (isDone) {
        console.log('LOADED', this.stringify)
        var tileSize = MapSettings.basePlaneDimension / (Math.pow(2, this._z));

        var material = MapSettings.debug ? new THREE.MeshBasicMaterial({
           wireframe: true,
           map: this.data.texture,
           opacity:0
        }) : new THREE.MeshBasicMaterial({
            map: this.data.texture,
        });

        var geometry = new THREE.PlaneGeometry(tileSize, tileSize);

        geometry.vertices = [
            new THREE.Vector3(-tileSize/2, 0, -tileSize/2),
            new THREE.Vector3(-tileSize/2, 0, tileSize/2),
            new THREE.Vector3(tileSize/2, 0, -tileSize/2),
            new THREE.Vector3(tileSize/2, 0, tileSize/2)
        ];
        geometry.faces = [
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(1, 3, 2)
        ];
        geometry.computeFaceNormals();

        var xOffset = (this._x+0.5)*tileSize - MapSettings.basePlaneDimension/2;
        var yOffset = (this._y+0.5)*tileSize - MapSettings.basePlaneDimension/2;

        geometry.translate(xOffset, 0, yOffset);

        this._entity = new THREE.Mesh(geometry, material);
        this._entity.tile = this;

        this._quadTree.scene.add(this._entity);

        this._state = TileState.Done;

        // Trigger need update
        this._quadTree.needUpdate = true;
    }
}

Tile.prototype.imageryFailed = function(layerName) {
    this._state = TileState.Failed;
}

Object.defineProperties(Tile.prototype, {
    x: {
        get: function() {
            return this._x;
        }
    },
    y: {
        get: function() {
            return this._y;
        }
    },
    z: {
        get: function() {
            return this._z;
        }
    },
    parent: {
        get : function() {
            return this._parent;
        }
    },
    children: {
        get : function() {
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
                        y: this._y * 2 + (i / 2) % 2,
                        z: this._z + 1,
                        parent: this,
                        quadTree: this._quadTree
                    });
                }
            }

            return this._children;
        }
    },
    active: {
        get: function() {
            return this._entity.visible;
        },
        set: function(value) {
            if (this.state == TileState.Start) {
                console.log('??', this.stringify)
            }
            if (this._entity) {
                this._entity.visible = value;
            }
        }
    },
    state: {
        get: function() {
            return this._state;
        }
    },
    needsLoading : {
        get: function() {
            return this._state < TileState.Loading;
        }
    },
    renderable: {
        get: function() {
            return this._state >= TileState.Done;
        }
    },
    center: {
        get: function() {
            var tileSize = MapSettings.basePlaneDimension / Math.pow(2, this._z);
            var xOffset = (this._x + 0.5) * tileSize - MapSettings.basePlaneDimension / 2;
            var yOffset = (this._y + 0.5) * tileSize - MapSettings.basePlaneDimension / 2;
            return new THREE.Vector3(xOffset, 0, yOffset);
        }
    },
    bbox: {
        get: function() {
            if (!this._bbox) {
                this._bbox = AABB.createAABBForTile(this);
            }
            return this._bbox;
        }
    },
    stringify: {
        get: function() {
            return this._x + "/" + this._y + "/" + this._z;
        }
    },
    eligibleForUnloading: {
        get: function() {
            return true;
        }
    }
});

Tile.prototype.freeResources = function() {
    console.log('DELETE', this.stringify)
    this.state = TileState.START;
    this.upsampledFromParent = false;
    // this.data = {};
    // this._parent = undefined;
    this._quadTree.scene.remove(this._entity);
    this._entity = undefined;

    if (this._children) {
        for (var i = 0; i < 4; ++i) {
            if (this._children[i]) {
                this._children[i].freeResources();
                this._children[i] = undefined;
            }
        }
    }
};
