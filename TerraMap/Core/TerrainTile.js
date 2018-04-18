var Tile = require('./Tile');
var Pool = require('./Pool');
var DataSource = require('./DataSource');
var TextureDataLayer = require('./TextureDataLayer');
var TerrainDataLayer = require('./TerrainDataLayer');

function TerrainTile (options) {
    Tile.call(this, options);

    this.data = new DataSource({
        layers: TerrainTile.dataLayers,
        tile: this
    });
}

TerrainTile.dataLayers = DataSource.toLayers([TextureDataLayer, TerrainDataLayer]);

TerrainTile.prototype = Object.create(Tile.prototype);

TerrainTile.prototype.constructor = TerrainTile;

TerrainTile.pool = new Pool({
    create: function () {
        var image = new Image();
        var material = new THREE.MeshBasicMaterial({
            map: new THREE.Texture(image)
        });

        var geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);

        return new THREE.Mesh(geometry, material);
    }
});

TerrainTile.prototype.freeResources = function () {
    Tile.prototype.freeResources.call(this);

    if (this._geometry) {
        this._geometry.dispose();
        this._geometry = undefined;
    }
    if (this._material) {
        this._material.dispose();
        this._material = undefined;
    }
};

TerrainTile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    mesh.material = this.material;

    mesh.scale.set(tileSize / 255, 1, tileSize / 255);

    mesh.geometry = this.geometry;
};

Object.defineProperties(TerrainTile.prototype, {
    /************************
     * THREE.js rendering
     ***********************/
    material: {
        get: function () {
            if (typeof this._material === 'undefined') {
                throw new Error('Material not ready to use.', this);
            }
            return this._material;
        }
    },
    geometry: {
        get: function () {
            if (typeof this._geometry === 'undefined') {
                throw new Error('Geometry not ready to use.', this);
            }
            return this._geometry;
        }
    },
});

module.exports = TerrainTile;
