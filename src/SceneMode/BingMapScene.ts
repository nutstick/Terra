import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { BingMapImageryProvider } from '../DataSource/BingMapImageryProvider';
import { Ellipsoid } from '../Math/Ellipsoid';
import { SceneMode } from './SceneMode';
import { Tile2D } from './Tile2D';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class BingMapScene extends SceneMode {
    _levelZeroMaximumGeometricError: number;
    constructor() {
        super({
            instance: Tile2D,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 2,
            numberOfLevelZeroTilesY: 2,
        });
        this.providers = [
            new BingMapImageryProvider(),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            45,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
