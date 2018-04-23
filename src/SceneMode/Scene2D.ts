import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { ImageryProvider } from '../DataSource/ImageryProvider';
import { AABB } from '../Math/AABB';
import { Cartesian } from '../Math/Cartesian';
import { Ellipsoid } from '../Math/Ellipsoid';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { SceneMode } from './SceneMode';
import { Tile } from './Tile';
import { Tile2D } from './Tile2D';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

export class Scene2D extends SceneMode {
    protected _levelZeroMaximumGeometricError: number;
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
            65,
            this._tilingScheme.getNumberOfXTilesAtLevel(0),
        );
    }
}
