var Tile = require('./Tile');
var MapSettings = require('./MapSettings');
var Pool = require('./Pool');

function TerrainTile (options) {
    Tile.call(this, options);

    this.data = {
      texture: undefined,
      terrain: undefined
    }
}

TerrainTile.prototype = Object.create(Tile.prototype);

TerrainTile.prototype.constructor = TerrainTile;

TerrainTile.pool = new Pool({
    create: function () {
        var image = new Image();
        var material = new THREE.MeshBasicMaterial({
          map : new THREE.Texture(image)
        });

        var geometry = new THREE.PlaneBufferGeometry(1, 1, 511, 511);

        // geometry.rotateX(-Math.PI / 2);

        return new THREE.Mesh(geometry, material);
    }
});

TerrainTile.prototype.imageryLoading = function (layerName, data) {
    if (this._state === Tile.TileState.Failed) return;

    // TODO: Loading
    this._state = Tile.TileState.Loading;

    this.data[layerName] = data;
};

TerrainTile.prototype.imageryDone = function (layerName, data) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== Tile.TileState.Loading) return;

    this.data[layerName] = data;
    
    if (layerName === 'terrain') {
        if (this.data.texture) {
            this._material = new THREE.MeshBasicMaterial({
                map: this.data.texture
            });
        } else {
            this._material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0x999999
            });
        }
        this._state = Tile.TileState.Done;

        // Trigger need update
        this._quadTree.needUpdate = true;
    } else if (layerName === 'texture') {
        if (this._material) {
            this._material.map = this.data.texture;
            this._material.wireframe = false;
            this._material.color = undefined;
            this._material.needUpdate = true;
        }
    } else {
        throw new Error('Unknow layerName.');
    }
};

TerrainTile.prototype.imageryFailed = function (layerName) {
    this._state = Tile.TileState.Failed;
};

TerrainTile.prototype.freeResources = function () {
};

TerrainTile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    var geometry = new THREE.PlaneBufferGeometry(512, 512, 511, 511);

    mesh.material = this.material;

    mesh.scale.set(tileSize / 512, 1, tileSize / 512);

    mesh.geometry = geometry;
    geometry.attributes.position.array = this.data.terrain;
}

Object.defineProperties(TerrainTile.prototype, {
    children: {
        get: function () {
            if (typeof this._children === 'undefined') {
                this._children = new Array(4);
            }

            for (var i = 0; i < 4; ++i) {
                if (typeof this._children[i] === 'undefined') {
                    this._children[i] = new TerrainTile({
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

    /************************
     * THREE.js rendering
     ***********************/
    material: {
        get: function () {
            return this._material;
        }
    },
});

TerrainTile.createRootTile = function (quadTree, tilingScheme) {
    if (!tilingScheme) {
        throw new Error('No tiling scheme provided');
    }

    var numberOfLevelZeroTilesX = tilingScheme.getNumberOfXTilesAtLevel(0);
    var numberOfLevelZeroTilesY = tilingScheme.getNumberOfYTilesAtLevel(0);

    var result = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);

    var index = 0;
    for (var y = 0; y < numberOfLevelZeroTilesY; ++y) {
        for (var x = 0; x < numberOfLevelZeroTilesX; ++x) {
            result[index++] = new TerrainTile({
                x: x,
                y: y,
                z: 0,
                quadTree: quadTree
            });
        }
    }

    return result;
};

module.exports = TerrainTile;
