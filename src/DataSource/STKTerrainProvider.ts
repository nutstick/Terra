import * as THREE from 'three';
import { Tile } from '../SceneMode/Tile';
import * as c from '../Utility/TypeConversion';
import { Provider, ProviderOptions } from './Provider';
import { STKTerrainDataLayer } from './STKTerrainDataLayer';

export interface STKTerrainProviderOptions extends ProviderOptions {}

export class STKTerrainProvider extends Provider {
    private _ready: boolean = false;
    private _baseUrl: string;
    private _zoomMax: number;
    private _zoomMin: number;
    private _version: string;
    private _projection: string;

    constructor(options?: STKTerrainProviderOptions) {
        super(options);

        const meta = new XMLHttpRequest();
        meta.open('GET', 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/layer.json', true);

        const onMetaComplete = () => {
            const response = JSON.parse(meta.response);
            this._baseUrl = `http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/${response.tiles}`;
            this._zoomMax = response.maxzoom;
            this._zoomMin = response.minzoom;
            this._version = response.version;
            this._projection = response.projection;

            this._ready = true;
        };
        meta.setRequestHeader('Accept', 'application/json,*/*;q=0.01');
        meta.addEventListener('load', onMetaComplete.bind(this));
        meta.send(null);
    }

    url(x: number, y: number, z: number) {
        const replaceParameters = {
            x: y,
            y: x,
            z,
            version: this._version,
        };

        const url = Object.keys(replaceParameters).reduce((prev, key) => {
            const value = replaceParameters[key];
            return prev.replace(new RegExp('{' + key + '}', 'g'), encodeURIComponent(value));
        }, this._baseUrl);

        return url;
    }

    getHeader(data, byteCount) {
        return {
            bytes: data.byteLength,
            centerX: c.getFloat64(data, byteCount),
            centerY: c.getFloat64(data, byteCount + 8),
            centerZ: c.getFloat64(data, byteCount + 16),
            minimumHeight: c.getFloat32(data, byteCount + 24),
            maximumHeight: c.getFloat32(data, byteCount + 28),
            boundingSphereCenterX: c.getFloat64(data, byteCount + 32),
            boundingSphereCenterY: c.getFloat64(data, byteCount + 40),
            boundingSphereCenterZ: c.getFloat64(data, byteCount + 48),
            boundingSphereRadius: c.getFloat64(data, byteCount + 56),
            horizonOcclusionPointX: c.getFloat64(data, byteCount + 64),
            horizonOcclusionPointY: c.getFloat64(data, byteCount + 72),
            horizonOcclusionPointZ: c.getFloat64(data, byteCount + 80),
        };
    }

    parseTile(data) {
        let byteCount = 0;

        const header = this.getHeader(data, byteCount);
        byteCount += 88;

        const vertexCount = c.getUint32(data, byteCount);
        byteCount += c.UINT32_BYTE_SIZE;

        const uArray = c.getUint16Array(data, byteCount, vertexCount);
        byteCount += vertexCount * c.UINT16_BYTE_SIZE;

        const vArray = c.getUint16Array(data, byteCount, vertexCount);
        byteCount += vertexCount * c.UINT16_BYTE_SIZE;

        const heightArray = c.getUint16Array(data, byteCount, vertexCount);
        byteCount += vertexCount * c.UINT16_BYTE_SIZE;

        let i;
        let u = 0;
        let v = 0;
        let height = 0;

        for (i = 0; i < uArray.length; ++i) {
            u += c.zigZagDecode(uArray[i]);
            v += c.zigZagDecode(vArray[i]);
            height += c.zigZagDecode(heightArray[i]);

            uArray[i] = u;
            vArray[i] = v;
            heightArray[i] = height;
        }

        if (byteCount % 2 !== 0) {
            byteCount += (2 - (byteCount % 2));
        }

        const triangleCount = c.getUint32(data, byteCount);
        byteCount += c.UINT32_BYTE_SIZE;

        const indices = c.getUint16Array(data, byteCount, triangleCount * 3);
        byteCount += triangleCount * 3 * 2;

        const indexArray = c.highwaterDecode(indices);
        return [header, uArray, vArray, heightArray, indexArray];
    }

    loadTile(tile: Tile) {
        if (!this._ready) {
            tile._quadTree.needUpdate = true;
            return;
        }

        if (this._loading >= this._maxLoad || tile.data.isLoading(STKTerrainDataLayer.layerName)) {
            return;
        }

        // FIXME: Debugging
        if (tile.z >= 2) return;

        this._loading++;

        const onComplete = (resp) => {
            this._needUpdate = true;
            this._loading--;

            if (tile.disposed) {
                return;
            }
            tile.data.loaded(STKTerrainDataLayer.layerName, this.parseTile(xhr.response));
        };

        const onError = (err) => {
            if (err) {
                if (tile.disposed) {
                    return;
                }
                this._loading--;

                console.error('Error loading stk-terrain' + tile.stringify);
                tile.data.failed(STKTerrainDataLayer.layerName, err);
            }
        };

        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.url(tile.x, tile.y, tile.z), true);
        xhr.setRequestHeader('Accept', ' application/vnd.quantized-mesh,application/octet-stream;q=1.0');
        xhr.responseType = 'arraybuffer';
        xhr.onload = onComplete;
        xhr.send(null);

        tile.data.loading(STKTerrainDataLayer.layerName);
    }
}
