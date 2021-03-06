import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { EPSG4326MapImageryProvider } from '../DataSource/EPSG4326MapImageryProvider';
import { TestProvider } from '../DataSource/TestProvider';
import { Ellipsoid } from '../Math/Ellipsoid';
import { SceneMode } from './SceneMode';
import { TestTile } from './TestTile';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class TestScene extends SceneMode {
    _levelZeroMaximumGeometricError: number;
    constructor() {
        super({
            instance: TestTile,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 4,
            numberOfLevelZeroTilesY: 2,
        });
        this.providers = [
            // new EPSG4326MapImageryProvider(),
            new TestProvider(),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            65,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
