var Tile = require('./Tile');
var MapSettings = require('./MapSettings');
var Pool = require('./Pool');

function TerrainSTKTile (options) {
    Tile.call(this, options);

    this.data = {
      texture: undefined,
      terrain: undefined
    }
}

TerrainSTKTile.prototype = Object.create(Tile.prototype);

TerrainSTKTile.prototype.constructor = TerrainSTKTile;

TerrainSTKTile.pool = new Pool({
    create: function () {
        var image = new Image();
        var material = new THREE.MeshBasicMaterial({
          map : new THREE.Texture(image)
        });

        var geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);

        return new THREE.Mesh(geometry, material);
    }
});

TerrainSTKTile.prototype.imageryLoading = function (layerName, data) {
    if (this._state === Tile.TileState.Failed) return;

    // TODO: Loading
    this._state = Tile.TileState.Loading;

    this.data[layerName] = data;
};

var scale = 1024;
TerrainSTKTile.prototype.getVertices = function (header, uArray, vArray, heightArray, indexArray) {
    var vertices = [];
    var h = header.maximumHeight - header.minimumHeight
    for (var i = 0; i < uArray.length; i++) {
        vertices.push(new THREE.Vector3(
            uArray[i] * scale / 32767 - scale / 2,
            heightArray[i] / 32767 * h + header.minimumHeight,
            - vArray[i] * scale / 32767 + scale / 2
        ));
    }
    return vertices;
}

TerrainSTKTile.prototype.getFaces = function (header, uArray, vArray, heightArray, indexArray) {
    var faces = [];
    for (var i = 0; i < indexArray.length; i+=3) {
        faces.push(new THREE.Face3(indexArray[i+0], indexArray[i+1], indexArray[i+2]));
    }
    return faces;
}

TerrainSTKTile.prototype.getFaceVerteUvs = function (header, uArray, vArray, heightArray, indexArray) {
    var verticesUv = [];
    for (var i = 0; i < uArray.length; i++) {
        verticesUv.push(new THREE.Vector2(
            uArray[i] / 32767,
            vArray[i] / 32767
        ));
    }

    var faceVertexUvs = [];
    for (var i = 0; i < indexArray.length; i+=3) {
        faceVertexUvs.push([
            verticesUv[indexArray[i + 0]],
            verticesUv[indexArray[i + 1]],
            verticesUv[indexArray[i + 2]]
        ]);
    }
    return faceVertexUvs;
}

TerrainSTKTile.prototype.imageryDone = function (layerName, data) {
    // If the state of tile is not loading means tile is after freeResource or fail download
    if (this._state !== Tile.TileState.Loading) return;

    this.data[layerName] = data;
    
    if (layerName === 'terrain') {
        if (this.data.texture) {
            this._material = new THREE.MeshBasicMaterial({
                wireframe: true,
                map: this.data.texture
            });
        } else {
            this._material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0x999999
            });
        }

        this.header = data[0];
        var uArray = data[1];
        var vArray = data[2];
        var heightArray = data[3];
        var indexArray = data[4];
        
        var vertices = this.getVertices(this.header, uArray, vArray, heightArray, indexArray);
        var faces = this.getFaces(this.header, uArray, vArray, heightArray, indexArray);

        this._geometry = new THREE.Geometry();
        this._geometry.vertices = vertices;
        this._geometry.faces = faces;
        
        this._geometry.computeFaceNormals();
        this._geometry.computeVertexNormals();
        this._geometry.faceVertexUvs[0] = this.getFaceVerteUvs(this.header, uArray, vArray, heightArray, indexArray);
        this._geometry.uvsNeedUpdate = true;

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

TerrainSTKTile.prototype.imageryFailed = function (layerName) {
    this._state = Tile.TileState.Failed;
};

TerrainSTKTile.prototype.freeResources = function () {
};

TerrainSTKTile.prototype.applyDataToMesh = function (mesh) {
    var tileSize = Tile.size(this.z);

    mesh.material = this.material;

    mesh.scale.set(tileSize / scale, 10, tileSize / scale);

    mesh.geometry = this.geometry;
}

Object.defineProperties(TerrainSTKTile.prototype, {
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

module.exports = TerrainSTKTile;
