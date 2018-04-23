import * as THREE from 'three';
import { Tile } from '../SceneMode/Tile';
import { EPSG4326MapImageDataLayer } from './EPSG4326MapImageDataLayer';
import { Provider, ProviderOptions } from './Provider';

export interface EPSG4326MapImageryProviderOptions extends ProviderOptions {
    key?: string;
}

export class EPSG4326MapImageryProvider extends Provider {
    private _ready: boolean = false;

    private _baseUrl: string;
    private _subdomains: string[];
    private _zoomMax: number;
    private _zoomMin: number;

    constructor(options?: EPSG4326MapImageryProviderOptions) {
        super(options);

        options = options || {};
        const key = options.key || 'AlIY82q0z4SlJW9J3rfNWds2dBKwqw7Rb7EJXesX56XaO4ZM1AgXcFiV8MALrHhM';
        const meta = new XMLHttpRequest();
        meta.open('GET', 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=' + key, true);

        const onMetaComplete = () => {
            const response = JSON.parse(meta.response);

            const resources = response.resourceSets[0].resources[0];
            this._baseUrl = resources.imageUrl;
            this._subdomains = resources.imageUrlSubdomains;
            this._zoomMax = resources.zoomMax;
            this._zoomMin = resources.zoomMin - 1;
            this._ready = true;
        };
        meta.addEventListener('load', onMetaComplete.bind(this));
        meta.send(null);
    }

    tileXYToQuadKey(x, y, level) {
        let quadkey = '';
        for (let i = level; i >= 0; --i) {
            const bitmask = 1 << i;
            let digit = 0;

            if ((x & bitmask) !== 0) {
                digit |= 1;
            }

            if ((y & bitmask) !== 0) {
                digit |= 2;
            }

            quadkey += digit;
        }
        return quadkey;
    }

    protected url(x: number, y: number, z: number) {
        const subdomains = this._subdomains;
        const subdomainIndex = (x + y + z) % subdomains.length;

        const replaceParameters = {
            subdomain: subdomains[subdomainIndex],
            quadkey: this.tileXYToQuadKey(x, y, z),
        };

        const url = Object.keys(replaceParameters).reduce((prev, key) => {
            const value = replaceParameters[key];
            return prev.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
        }, this._baseUrl);

        return url;
    }

    loadTile(tile: Tile) {
        if (!this._ready) {
            tile.quadTree.needUpdate = true;
            return;
        }
        if (this._loading >= this._maxLoad || tile.data.isLoading(EPSG4326MapImageDataLayer.layerName)) {
            return;
        }

        // FIXME: Debugging
        // if (tile.z >= 1) return;

        let doneCount = 0;

        const onComplete = (resp) => {
            this._needUpdate = true;
            this._loading--;

            if (tile.disposed) {
                return;
            }

            doneCount++;
            if (doneCount === 2) {
                tile.data.loaded(EPSG4326MapImageDataLayer.layerName, [t0, t1]);
            }
        };

        const onError = (err) => {
            if (err) {
                if (tile.disposed) {
                    return;
                }
                this._loading--;

                console.error('Error loading texture' + tile.stringify);
                tile.data.failed(EPSG4326MapImageDataLayer.layerName, err);
            }
        };

        this._loading++;
        const t0 = new THREE.TextureLoader()
            .load(this.url(tile.x, tile.y * 2, tile.z), onComplete.bind(this), undefined, onError.bind(this));
        const t1 = new THREE.TextureLoader()
            .load(this.url(tile.x, tile.y * 2 + 1, tile.z), onComplete.bind(this), undefined, onError.bind(this));
        tile.data.loading(EPSG4326MapImageDataLayer.layerName);
    }
}
