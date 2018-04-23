import { Ellipsoid } from '../Math/Ellipsoid';

export interface TilingSchemeOptions {
    numberOfLevelZeroTilesX: number;
    numberOfLevelZeroTilesY: number;
}

export class TilingScheme {
    private _ellipsoid: Ellipsoid;
    private _numberOfLevelZeroTilesX: number;
    private _numberOfLevelZeroTilesY: number;
    constructor(options: TilingSchemeOptions) {
        this._ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);
        this._numberOfLevelZeroTilesX = options.numberOfLevelZeroTilesX;
        this._numberOfLevelZeroTilesY = options.numberOfLevelZeroTilesY;
    }

    getNumberOfXTilesAtLevel(level) {
        return this._numberOfLevelZeroTilesX << level;
    }

    getNumberOfYTilesAtLevel(level) {
        return this._numberOfLevelZeroTilesY << level;
    }

    get ellipsoid() { return this._ellipsoid; }
}
