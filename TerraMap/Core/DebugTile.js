var Tile = require('./Tile');
var Pool = require('./Pool');
var DataSource = require('./DataSource');
var DebugDataLayer = require('./DebugDataLayer');

function DebugTile (options) {
    Tile.call(this, options);

    this.data = new DataSource({
        layers: DebugTile.dataLayers,
        tile: this
    });
}

DebugTile.dataLayers = DataSource.toLayers([DebugDataLayer]);

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

DebugTile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    mesh.scale.set(tileSize, 1, tileSize);
};

DebugTile.prototype.freeResources = function () {
    Tile.prototype.freeResources.call(this);
};

module.exports = DebugTile;
