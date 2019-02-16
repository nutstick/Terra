import * as THREE from 'three';
import { QuadTree } from '../Core/QuadTree';
import { TerrainTile } from '../SceneMode/TerrainTile';
import { Provider, ProviderOptions } from './Provider';
import { TerrainRGBDataLayer } from './TerrainRGBDataLayer';

export interface TerrainRGBProviderOptions extends ProviderOptions {
    context2d: any;
}

export class TerrainRGBProvider extends Provider {
    private context2d: any;
    constructor(options: TerrainRGBProviderOptions) {
        super(options);

        this.context2d = options.context2d;
    }

    url(x: number, y: number, z: number): string {
        const serverIndex = 2 * (x % 2) + y % 2;
        const server = ['a', 'b', 'c', 'd'][serverIndex];
        return 'https://' + server + '.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + z + '/' + x + '/' + y +
            '.pngraw?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
    }

    loadTile(tile: TerrainTile) {
        if (this._loading >= this._maxLoad) {
            return;
        }

        if (tile.data.isLoading(TerrainRGBDataLayer.layerName)) {
            return;
        }

        const scope = this;
        if (typeof Qt === 'object') {
            const url = this.url(tile.x, tile.y, tile.z);
            const loaded = function() {
                if (tile.stringify !== this.stringify) {
                    return;
                }
                canvas2d.imageLoaded.disconnect(loaded);

                scope.context2d.drawImage(url, 0, 0);
                const pixels = scope.context2d.getImageData(0, 0, 256, 256);

                tile.data.loaded(TerrainRGBDataLayer.layerName, pixels.data);

                scope._needUpdate = true;
                scope._loading--;
            }.bind(tile);
            canvas2d.loadImage(url);
            canvas2d.imageLoaded.connect(loaded);
        } else {
            const data = new Image();
            data.crossOrigin = 'Anonymous';
            data.addEventListener('load', () => {
                scope.context2d.drawImage(data, 0, 0);
                const pixels = scope.context2d.getImageData(0, 0, data.width, data.height);

                tile.data.loaded(TerrainRGBDataLayer.layerName, pixels.data);

                scope._needUpdate = true;
                scope._loading--;
            });
            data.addEventListener('error', (err) => {
                if (err) {
                    tile.data.failed(TerrainRGBDataLayer.layerName, err);

                    scope._needUpdate = true;
                    scope._loading--;
                    // console.error('Error loading terrain ' + tile.stringify);
                }
            });
            data.src = this.url(tile.x, tile.y, tile.z);
        }

        tile.data.loading(TerrainRGBDataLayer.layerName);
    }
}
