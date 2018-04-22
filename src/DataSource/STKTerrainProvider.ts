import * as THREE from 'three';
import { Tile } from '../SceneMode/Tile';
import { ImageDataLayer } from './ImageDataLayer';
import { Provider, ProviderOptions } from './Provider';

export interface STKTerrainProviderOptions extends ProviderOptions {}

export class STKTerrainProvider extends Provider {
    constructor(options?: STKTerrainProviderOptions) {
        super(options);

        const meta = new XMLHttpRequest();
        meta.open('GET', 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/layer.json', true);

        const onMetaComplete = () => {
            const response = JSON.parse(meta.response);
            console.log(response)
        };
        meta.setRequestHeader('Accept', 'application/json,*/*;q=0.01');
        meta.addEventListener('load', onMetaComplete.bind(this));
        meta.send(null);
    }

    url(x: number, y: number, z: number) {
        const serverIndex = 2 * (x % 2) + y % 2;
        const server = ['a', 'b', 'c', 'd'][serverIndex];
        return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.satellite/' + z + '/' + x + '/' + y +
            '@2x.png?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
    }

    loadTile(tile: Tile) {
        if (this._loading >= this._maxLoad) {
            return;
        }

        if (tile.data.isLoading(ImageDataLayer.layerName)) {
            return;
        }

        const onComplete = (resp) => {
            this._needUpdate = true;
            this._loading--;

            if (tile.disposed) {
                return;
            }
            tile.data.loaded(ImageDataLayer.layerName, texture);
        };

        const onError = (err) => {
            if (err) {
                if (tile.disposed) {
                    return;
                }
                this._loading--;

                console.error('Error loading texture' + tile.stringify);
                tile.data.failed(ImageDataLayer.layerName, err);
            }
        };

        this._loading++;
        const texture = new THREE.TextureLoader()
            .load(this.url(tile._x, tile._y, tile._z), onComplete.bind(this), undefined, onError.bind(this));
        tile.data.loading(ImageDataLayer.layerName);
    }
}
