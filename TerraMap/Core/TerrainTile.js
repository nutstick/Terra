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

        var geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);

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

var scale = 512;

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

        this._geometry = new THREE.PlaneBufferGeometry(512, 512, 255, 255);
        this._geometry.attributes.position.array = this.data.terrain;
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

    var allDone = Object.values(this.data).reduce(function (p, v) { return p && v; }, true);
    if (allDone) {
        this._state = Tile.TileState.Done;
    }
};

TerrainTile.prototype.imageryFailed = function (layerName) {
    this._state = Tile.TileState.Failed;
};

TerrainTile.prototype.freeResources = function () {
};

TerrainTile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    mesh.material = this.material;

    mesh.scale.set(tileSize / scale, 1, tileSize / scale);

    mesh.geometry = this.geometry;
}

Object.defineProperties(TerrainTile.prototype, {
    /************************
     * THREE.js rendering
     ***********************/
    material: {
        get: function () {
            return this._material;
        }
    },
    geometry: {
        get: function () {
            return this._geometry;
        }
    },
});

module.exports = TerrainTile;
