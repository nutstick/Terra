import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { EPSG4326MapImageryProvider } from '../DataSource/EPSG4326MapImageryProvider';
import { ImageryProvider } from '../DataSource/ImageryProvider';
import { TerrainRGBProvider } from '../DataSource/TerrainRGBProvider';
import { TestProvider } from '../DataSource/TestProvider';
import { Ellipsoid } from '../Math/Ellipsoid';
import { SceneMode } from './SceneMode';
import { TerrainTile } from './TerrainTile';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class TerrainScene extends SceneMode {
    _levelZeroMaximumGeometricError: number;
    constructor(context2d) {
        super({
            instance: TerrainTile,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 1,
            numberOfLevelZeroTilesY: 1,
        });
        this.providers = [
            new ImageryProvider(),
            new TerrainRGBProvider({ context2d }),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            65,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
