var Tile = require('./Tile');
var MapSettings = require('./MapSettings');

function DebugTile (options) {
    Tile.call(this, options);
}

DebugTile.prototype = Object.create(Tile.prototype);

DebugTile.prototype.imageryLoading = function (layerName, texture) {
    if (this._state === this.TileState.Failed) return;

    this._state = this.TileState.Loading;
};

DebugTile.prototype.imageryDone = function (layerName) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== this.TileState.Loading) return;

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

    this._state = this.TileState.Done;

    // Trigger need update
    this._quadTree.needUpdate = true;
};

DebugTile.prototype.imageryFailed = function (layerName) {
    this._state = this.TileState.Start;
};

DebugTile.prototype.freeResources = function () {
};

Object.defineProperties(DebugTile.prototype, {
    material: {
        get: function () {
            if (!this._material) {
                this._material = new THREE.MeshBasicMaterial({
                    wireframe: true,
                    opacity: 0
                });
            }
            return this._material;
        }
    },
    children: {
        get: function () {
            if (typeof this._children === 'undefined') {
                this._children = new Array(4);
                this._children[0] = new DebugTile({
                    x: this._x * 2,
                    y: this._y * 2,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[1] = new DebugTile({
                    x: this._x * 2 + 1,
                    y: this._y * 2,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[2] = new DebugTile({
                    x: this._x * 2,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
                this._children[3] = new DebugTile({
                    x: this._x * 2 + 1,
                    y: this._y * 2 + 1,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree
                });
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
