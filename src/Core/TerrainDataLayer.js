var DataSource = require('./DataSource');
var DataSourceLayer = require('./DataSourceLayer');
var TerrainGenerator = require('../Services/TerrainGenerator');

function TerrainDataLayer () {}

TerrainDataLayer.prototype = Object.create(DataSourceLayer.prototype);

TerrainDataLayer.layerName = 'terrain';

var vertices = 256;
var segments = vertices - 1;

TerrainDataLayer.prototype.processData = function (tile, data) {
    // var elevations = [];

    tile._geometry = new THREE.PlaneGeometry(segments, segments, segments, segments);
    
    for (var e = 0; e < data.length; e += 4) {
        var R = data[e];
        var G = data[e + 1];
        var B = data[e + 2];

        var i = e / 4;
        var posX = (i % TerrainGenerator.imageSize) - vertices / 2;
        var elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1);
        var posZ = ((i - i % TerrainGenerator.imageSize) / TerrainGenerator.imageSize) - vertices / 2;
        // elevation *= 10;
        tile._geometry.vertices[i].x = posX;
        tile._geometry.vertices[i].y = elevation;
        tile._geometry.vertices[i].z = posZ;
        // elevations.push(posX, elevation, posZ);
    }

    // tile._geometry.attributes.position.array = new Float32Array(elevations);

    tile.data.status[TerrainDataLayer.layerName] = DataSource.State.Loaded;
};

TerrainDataLayer.prototype.processError = function (tile, error) {
    var elevations = [];

    for (var e = 0; e < TerrainGenerator.imageSize * TerrainGenerator.imageSize; e++) {
        var posX = (e % TerrainGenerator.imageSize) - 127;
        var posZ = (e / TerrainGenerator.imageSize) - 127;
        elevations.push(posX, 0, posZ);
    }

    this._geometry = new THREE.PlaneBufferGeometry(vertices, vertices, segments, segments);
    this._geometry.attributes.position.array = new Float32Array(elevations);

    tile.data.status[TerrainDataLayer.layerName] = DataSource.State.Loaded;
};

module.exports = TerrainDataLayer;
