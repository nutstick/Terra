import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { BingMapImageryProvider } from '../DataSource/BingMapImageryProvider';
import { STKTerrainProvider } from '../DataSource/STKTerrainProvider';
import { Ellipsoid } from '../Math/Ellipsoid';
import { SceneMode } from './SceneMode';
import { STKTerrainTile } from './STKTerrainTile';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class STKTerrainScene extends SceneMode {
    _levelZeroMaximumGeometricError: number;
    constructor() {
        super({
            instance: STKTerrainTile,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 2,
            numberOfLevelZeroTilesY: 1,
        });
        this.providers = [
            new BingMapImageryProvider(),
            new STKTerrainProvider(),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            45,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
