function DataSource (options) {
    if (!options) {
        throw new Error('DataSource must provided arguments.');
    }

    if (!options.layers) {
        throw new Error('DataSource must provided options.layers');
    }

    if (!options.tile) {
        throw new Error('DataSource must provided options.tile');
    }

    /**
     * @type {DataSourceLayer[]}
     */
    this._layers = options.layers;

    /**
     * @type {Tile}
     */
    this._tile = options.tile;

    /**
     * @type {Object}
     */
    this.status = {};

    var keys = Object.keys(this._layers);
    for (var i = 0; i < keys.length; ++i) {
        this.status[keys[i]] = DataSource.State.Idle;
    }
}

DataSource.toLayers = function (layers) {
    var _layers = {};
    for (var i = 0; i < layers.length; ++i) {
        var Instance = layers[i];
        _layers[layers[i].layerName] = new Instance();
    }
    return _layers;
};

DataSource.State = {
    Idle: 1,
    Loading: 2,
    Loaded: 3,
    Failed: 4
};

/**
 * @param {string} layer - Layer name
 */
DataSource.prototype.loading = function (layer) {
    if (typeof this._layers[layer] === 'undefined') {
        throw new Error('Unknowed layer was trigger datasource.');
    }

    this.status[layer] = DataSource.State.Loading;
};

DataSource.prototype.loaded = function (layer, data) {
    if (!this._tile) {
        // TODO: Dispose;
        return;
    }
    if (typeof this._layers[layer] === 'undefined') {
        throw new Error('Unknowed layer was trigger datasource.');
    }

    this._layers[layer].processData(this._tile, data);

    if (this.done) {
        this._tile._quadTree.needUpdate = true;
    }
};

DataSource.prototype.failed = function (layer, error) {
    if (typeof this.status[layer] === 'undefined') {
        throw new Error('Unknowed layer was trigger datasource.');
    }

    this._layers[layer].processError(this._tile, error);
};

DataSource.prototype.isLoading = function (layer) {
    return this.status[layer] >= DataSource.State.Loading;
};

DataSource.prototype.dispose = function () {
    var keys = Object.keys(this._layers);
    for (var i = 0; i < keys.length; ++i) {
        this.status[keys[i]] = DataSource.State.Idle;
        this._tile = undefined;
    }
};

Object.defineProperties(DataSource.prototype, {
    done: {
        get: function () {
            var keys = Object.keys(this._layers);
            for (var i = 0; i < keys.length; ++i) {
                if (this.status[keys[i]] !== DataSource.State.Loaded) {
                    return false;
                }
            }
            return true;
        }
    },
    needsLoading: {
        get: function () {
            var keys = Object.keys(this._layers);
            for (var i = 0; i < keys.length; ++i) {
                if (this.status[keys[i]] < DataSource.State.Loaded) {
                    return true;
                }
            }
            return false;
        }
    }
});

module.exports = DataSource;
