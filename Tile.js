// ECMAScript 6

Qt.include("/Core/DeveloperError.js");
Qt.include("/Core/TileReplacementQueue.js");

var TileState = {
    Start: 0,
    Loading: 1,
    Done: 2,
    Failed: 3
};

function Tile(option) {
    if (!option) {
        throw new Error('No option provided');
    }

    if (typeof option.x === 'undefined') throw new Error('No option.x provided');
    this._x = option.x;
    if (typeof option.y === 'undefined') throw new Error('No option.y provided');
    this._y = option.y;
    if (typeof option.z === 'undefined') throw new Error('No option.z provided');
    this._z = option.z;

    // QuadTreeTile structure
    this._parent = option.parent;
    // State
    this._state = TileState.Start;

    this._entity = undefined;

    // QuadtreeTileReplacementQueue gets/sets these private properties.
    this._replacementPrevious = undefined;
    this._replacementNext = undefined;

    this._distance = 0.0;

    this.upsampledFromParent = false;
}

Tile.createRootTile = function(tilingScheme) {
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
                z: 0
            });
        }
    }

    return result;
}

Tile.prototype.setLoading = function() {
    this._state = TileState.Loading;
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
                this._children[0] = new Tile({ x: this._x * 2, y: this._y * 2, z: this._z + 1, parent: this });
                this._children[1] = new Tile({ x: this._x * 2 + 1, y: this._y * 2, z: this._z + 1, parent: this });
                this._children[2] = new Tile({ x: this._x * 2, y: this._y * 2 + 1, z: this._z + 1, parent: this });
                this._children[3] = new Tile({ x: this._x * 2 + 1, y: this._y * 2 + 1, z: this._z + 1, parent: this });
            }

            return this._children;
        }
    },
    active: {
        get: function() {
            return this._entity.visible;
        },
        set: function(value) {
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
            return this.state < TileState.Done;
        }
    },
    renderable: {
        get: function() {
            return this.state >= TileState.Done;
        }
    },
    center: {
        get: function() {
            var basePlaneDimension = 65 * Math.pow(2, 20);
            var tileSize = basePlaneDimension / Math.pow(2, this._z);
            var xOffset = (this._x + 0.5) * tileSize - basePlaneDimension / 2;
            var yOffset = (this._y + 0.5) * tileSize - basePlaneDimension / 2;
            return new THREE.Vector3(xOffset, 0, yOffset);
        }
    },
    stringify: {
        get: function() {
            return this._x + "/" + this._y + "/" + this._z;
        }
    }
})
