import * as THREE from 'three';
import { Tile } from '../SceneMode/Tile';
import { ImageDataLayer } from './ImageDataLayer';
import { Provider, ProviderOptions } from './Provider';

export interface ImageryProviderOptions extends ProviderOptions {}

export class ImageryProvider extends Provider {
    constructor(options?: ImageryProviderOptions) {
        super(options);
    }

    protected url(x: number, y: number, z: number) {
        const serverIndex = 2 * (x % 2) + y % 2;
        const server = ['a', 'b', 'c', 'd'][serverIndex];
        return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.satellite/' + z + '/' + x + '/' + y +
            '@2x.png?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
    }

    loadTile(tile: Tile) {
        if (this._loading >= this._maxLoad || tile.data.isLoading(ImageDataLayer.layerName)) {
            return;
        }

        const scope = this;
        const onComplete = (resp) => {
            scope._needUpdate = true;
            scope._loading--;

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
                scope._loading--;

                console.error('Error loading texture' + tile.stringify);
                tile.data.failed(ImageDataLayer.layerName, err);
            }
        };

        this._loading++;
        const texture = new THREE.TextureLoader()
            .load(this.url(tile.x, tile.y, tile.z), onComplete, undefined, onError);
        tile.data.loading(ImageDataLayer.layerName);
    }
}
