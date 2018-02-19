// ECMAScript 6

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
    if (typeof option.scene === 'undefined') throw new Error('No option.scene provided');
    this._scene = option.scene;

    // QuadTreeTile structure
    this._parent = option.parent;
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

Tile.createRootTile = function(scene, tilingScheme) {
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
                scene: scene
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
        var tileSize = MapSettings.basePlaneDimension / (Math.pow(2, this._z));

        var color = Math.random() * 0xffffff
        var material = MapSettings.debug ? new THREE.MeshBasicMaterial({
           wireframe: true,
           opacity:0
        }) : new THREE.MeshBasicMaterial({
            map: this.data.texture,
            color: color
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

        this._scene.add(this._entity);

        this._state = TileState.Done;
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
                    scene: this._scene
                });
                this._children[1] = new Tile({
                    x: this._x * 2 + 1,
                    y: this._y * 2,
                    z: this._z + 1,
                    parent: this,
                    scene: this._scene
                });
                this._children[2] = new Tile({
                    x: this._x * 2,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    scene: this._scene
                });
                this._children[3] = new Tile({
                    x: this._x * 2 + 1,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    scene: this._scene
                });
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
    }
});

Tile.prototype.freeResources = function() {
    this.state = TileState.START;
    this.data = {};
    this._entity = undefined;

    for (var i = 0; i < 4; ++i) {
        this._children[i].freeResources();
        this._children[i] = undefined;
    }
};
