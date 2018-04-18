var Tile = require('./Tile');
var Pool = require('./Pool');
var DataSource = require('./DataSource');
var TextureDataLayer = require('./TextureDataLayer');

function Tile2D (options) {
    Tile.call(this, options);

    this.data = new DataSource({
        layers: Tile2D.dataLayers,
        tile: this
    });
}

Tile2D.dataLayers = DataSource.toLayers([TextureDataLayer]);

Tile2D.prototype = Object.create(Tile.prototype);

Tile2D.prototype.constructor = Tile2D;

Tile2D.pool = new Pool({
    create: function () {
        var image = new Image();
        var material = new THREE.MeshBasicMaterial({ map: new THREE.Texture(image) });

        var geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        return new THREE.Mesh(geometry, material);
    }
});

Tile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    mesh.scale.set(tileSize, 1, tileSize);

    mesh.material = this.material;
};

Tile2D.prototype.freeResources = function () {
    Tile.prototype.freeResources.call(this);

    if (this._material) {
        this._material.dispose();
        this._material = undefined;
    }
};

Object.defineProperties(Tile2D.prototype, {
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
    }
});

module.exports = Tile2D;
