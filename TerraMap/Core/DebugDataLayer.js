var DataSource = require('./DataSource');
var DataSourceLayer = require('./DataSourceLayer');

function DebugDataLayer () {}

DebugDataLayer.prototype = Object.create(DataSourceLayer.prototype);

DebugDataLayer.layerName = 'debug';

DebugDataLayer.prototype.processData = function (tile) {
    tile.data.status[DebugDataLayer.layerName] = DataSource.State.Loaded;
};

DebugDataLayer.prototype.processError = function (tile, error) {
    throw new Error('Debug data can\'t be error.');
};

module.exports = DebugDataLayer;
