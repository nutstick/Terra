var Tile = require('./Tile');
var MapSettings = require('./MapSettings');
var Pool = require('./Pool');

function DebugTile (options) {
    Tile.call(this, options);
}

DebugTile.prototype = Object.create(Tile.prototype);

DebugTile.prototype.constructor = DebugTile;

DebugTile.pool = new Pool({
    create: function () {
        var material = new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity: 0
        });

        var geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        return new THREE.Mesh(geometry, material);
    }
});

DebugTile.prototype.imageryLoading = function (layerName, texture) {
    if (this._state === Tile.TileState.Failed) return;

    this._state = Tile.TileState.Loading;
};

DebugTile.prototype.imageryDone = function (layerName) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== Tile.TileState.Loading) return;
    this._state = Tile.TileState.Done;

    // Trigger need update
    this._quadTree.needUpdate = true;
};

DebugTile.prototype.imageryFailed = function (layerName) {
    this._state = Tile.TileState.Start;
};

DebugTile.prototype.freeResources = function () {
};

Object.defineProperties(DebugTile.prototype, {
    children: {
        get: function () {
            if (typeof this._children === 'undefined') {
                this._children = new Array(4);
            }

            for (var i = 0; i < 4; ++i) {
                if (typeof this._children[i] === 'undefined') {
                    this._children[i] = new DebugTile({
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
    material: {
        get: function () {
            if (!this._material) {
                return new THREE.MeshBasicMaterial({
                    wireframe: true,
                    opacity: 0
                });
            }
            return this._material;
        }
    },
});

DebugTile.createRootTile = function (quadTree, tilingScheme) {
    if (!tilingScheme) {
        throw new Error('No tiling scheme provided');
    }

    var numberOfLevelZeroTilesX = tilingScheme.getNumberOfXTilesAtLevel(0);
    var numberOfLevelZeroTilesY = tilingScheme.getNumberOfYTilesAtLevel(0);

    var result = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);

    var index = 0;
    for (var y = 0; y < numberOfLevelZeroTilesY; ++y) {
        for (var x = 0; x < numberOfLevelZeroTilesX; ++x) {
            result[index++] = new DebugTile({
                x: x,
                y: y,
                z: 0,
                quadTree: quadTree
            });
        }
    }

    return result;
};

module.exports = DebugTile;
