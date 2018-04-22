import { Tile } from '../SceneMode/Tile';
import { DataSourceLayer, DataSourceLayerConstructor } from './DataSourceLayer';

export interface Status {
    [key: string]: number;
}

export class DataSource {
    static State = {
        Idle: 1,
        Loading: 2,
        Loaded: 3,
        Failed: 4,
    };

    _layers: DataSourceLayer[];
    _tile: Tile;
    status: Status;

    constructor(options) {
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
        Object.keys(this._layers).forEach((key) => {
            this.status[key] = DataSource.State.Idle;
        });
    }
    /**
     * @param {string} layer - Layer name
     */
    loading(layer) {
        if (typeof this._layers[layer] === 'undefined') {
            throw new Error('Unknowed layer was trigger datasource.');
        }
        this._layers[layer].processLoading(this._tile);
    }
    loaded(layer, data) {
        if (!this._tile) {
            // TODO: Dispose;
            return;
        }
        if (typeof this._layers[layer] === 'undefined') {
            throw new Error('Unknowed layer was trigger datasource.');
        }
        this._layers[layer].processData(this._tile, data);
        if (this.done) {
            this._tile.quadTree.needUpdate = true;
        }
    }
    failed(layer, error) {
        if (typeof this.status[layer] === 'undefined') {
            throw new Error('Unknowed layer was trigger datasource.');
        }
        this._layers[layer].processError(this._tile, error);
    }
    isLoading(layer) {
        return this.status[layer] >= DataSource.State.Loading;
    }
    dispose() {
        Object.keys(this._layers).forEach((key) => {
            this.status[key] = DataSource.State.Idle;
        });
        this._tile = undefined;
    }
    static toLayers(layers: DataSourceLayerConstructor[]) {
        return layers.reduce((prev: { [key: string]: DataSourceLayer }, Instance) => {
            prev[Instance.layerName] = new Instance();
            return prev;
        }, {});
    }

    get done() {
        return Object.keys(this._layers).reduce((prev, key) =>
            prev && this.status[key] === DataSource.State.Loaded, true);
    }

    get needsLoading() {
        return Object.keys(this._layers).reduce((prev, key) =>
            prev || this.status[key] < DataSource.State.Loaded, false);
    }
}
