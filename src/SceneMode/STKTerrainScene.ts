import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { EPSG4326MapImageryProvider } from '../DataSource/EPSG4326MapImageryProvider';
import { STKTerrainProvider } from '../DataSource/STKTerrainProvider';
import { AABB } from '../Math/AABB';
import { Cartesian } from '../Math/Cartesian';
import { Ellipsoid } from '../Math/Ellipsoid';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { SceneMode } from './SceneMode';
import { STKTerrainTile } from './STKTerrainTile';
import { Tile } from './Tile';

function getEstimatedLevelZeroGeometricErrorForAHeightmap(
    ellipsoid: Ellipsoid, tileImageWidth: number, numberOfTilesAtLevelZero: number) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
}

const topLeftCorner = new Cartesian();
const bottomRightCorner = new Cartesian();

export class STKTerrainScene extends SceneMode {
    protected _levelZeroMaximumGeometricError: number;
    constructor() {
        super({
            instance: STKTerrainTile,
        });

        this._tilingScheme = new TilingScheme({
            numberOfLevelZeroTilesX: 2,
            numberOfLevelZeroTilesY: 1,
        });
        this.providers = [
            new EPSG4326MapImageryProvider(),
            new STKTerrainProvider(),
        ];

        this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
            this._tilingScheme.ellipsoid,
            45,
            this._tilingScheme.getNumberOfYTilesAtLevel(0),
        );
    }

    getAABB(tile: Tile) {
        // FIXME: FC
        const width = 360.0 / this._tilingScheme.getNumberOfXTilesAtLevel(tile.z);
        const height = 180.0 / this._tilingScheme.getNumberOfYTilesAtLevel(tile.z);
        this._topLeftCartographicCorner.longitude = tile.x * width - 180.0;
        this._topLeftCartographicCorner.altitude = 0;
        this._topLeftCartographicCorner.latitude = tile.y * height - 90.0;
        sphericalMercator.CartographicToEPSG4326(this._topLeftCartographicCorner, topLeftCorner);

        this._bottomRightCartographicCorner.longitude = (tile.x + 1) * width - 180.0;
        this._bottomRightCartographicCorner.altitude = 0;
        this._bottomRightCartographicCorner.latitude = (tile.y + 1) * height - 90.0;
        sphericalMercator.CartographicToEPSG4326(this._bottomRightCartographicCorner, bottomRightCorner);

        return new AABB({ topLeftCorner, bottomRightCorner });
    }
}
