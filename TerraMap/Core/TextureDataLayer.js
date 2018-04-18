var DataSource = require('./DataSource');
var DataSourceLayer = require('./DataSourceLayer');

function TextureDataLayer () {}

TextureDataLayer.prototype = Object.create(DataSourceLayer.prototype);

TextureDataLayer.layerName = 'texture';

TextureDataLayer.prototype.processData = function (tile, data) {
    if (tile._material) {
        throw new Error('Material\'s already set up.');
    }
    tile._material = new THREE.MeshBasicMaterial({
        map: data
    });

    tile.data.status[TextureDataLayer.layerName] = DataSource.State.Loaded;
};

TextureDataLayer.prototype.processError = function (tile, error) {
    tile.data.status[TextureDataLayer.layerName] = DataSource.State.Idle;
};

module.exports = TextureDataLayer;
