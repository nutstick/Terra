var Tile = require('./Tile');
var MapSettings = require('./MapSettings');
var Pool = require('./Pool');

function DebugTile (options) {
    Tile.call(this, options);
}

DebugTile.prototype = Object.create(Tile.prototype);

DebugTile.prototype.constructor = DebugTile;

DebugTile.createRootTile = Tile.createRootTile;

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
}

DebugTile.prototype.imageryLoading = function () {
    if (this._state === Tile.TileState.Failed) return;

    this._state = Tile.TileState.Loading;
};

DebugTile.prototype.imageryDone = function () {
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

module.exports = DebugTile;
