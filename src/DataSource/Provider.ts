import { Tile } from '../SceneMode/Tile';

export interface ProviderOptions {
    maxLoad?: number;
}

export abstract class Provider {
    _maxLoad: number;
    _loading: number;
    _needUpdate: boolean;

    constructor(options?: ProviderOptions) {
        options = options || {};
        this._maxLoad = options.maxLoad || 50;
        this._loading = 0;
    }

    abstract url(x: number, y: number, z: number);

    abstract loadTile(tile: Tile);
}
