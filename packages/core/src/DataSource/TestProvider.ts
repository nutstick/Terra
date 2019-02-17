import * as THREE from 'three';
import { Provider, ProviderOptions } from './Provider';
import { TestDataLayer } from './TestDataLayer';

export interface ImageryProviderOptions extends ProviderOptions {}

export class TestProvider extends Provider {
    constructor(options?: ImageryProviderOptions) {
        super(options);
    }

    url() {
        throw new Error('Can\'t call url of TestProvide');
    }

    loadTile(tile) {
        if (this._loading >= this._maxLoad) {
            return;
        }

        if (tile.data.isLoading(TestDataLayer.layerName)) {
            return;
        }

        const scope = this;
        if (typeof Qt === 'object') {
            timer.setTimeout(() => {
                tile.data.loaded(TestDataLayer.layerName);
                scope._loading--;
            }, 10);
        } else {
            setTimeout(() => {
                tile.data.loaded(TestDataLayer.layerName);
                scope._loading--;
            }, 10);
        }

        tile.data.loading(TestDataLayer.layerName);
    }
}
