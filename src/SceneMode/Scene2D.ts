import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { ImageryProvider } from '../DataSource/ImageryProvider';
import { Ellipsoid } from '../Math/Ellipsoid';
import { SceneMode } from './SceneMode';
import { Tile2D } from './Tile2D';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class Scene2D extends SceneMode {
    _levelZeroMaximumGeometricError: number;
    constructor() {
        super({
            instance: Tile2D,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 1,
            numberOfLevelZeroTilesY: 1,
        });
        this.providers = [
            new ImageryProvider(),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            45,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
