import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { Provider } from '../DataSource/Provider';
import { AABB } from '../Math/AABB';
import { Cartesian } from '../Math/Cartesian';
import { sphericalMercator } from '../Utility/SphericalMercator';
import { Tile, TileConstructor } from './Tile';

export interface SceneModeOptions {
    instance: TileConstructor;
}

const topLeftCorner = new Cartesian();
const bottomRightCorner = new Cartesian();

export abstract class SceneMode {
    providers: Provider[];
    protected _tilingScheme: TilingScheme;
    protected _instance: TileConstructor;

    protected _topLeftCartographicCorner = QtPositioning.coordinate();
    protected _bottomRightCartographicCorner = QtPositioning.coordinate();

    constructor(options: SceneModeOptions) {
        this._instance = options.instance;
    }

    getLevelMaximumGeometricError = function(level) {
        return this._levelZeroMaximumGeometricError / (1 << level);
    };

    fog(distanceToCamera: number, density: number) {
        const scalar = distanceToCamera * density;
        return 1.0 - Math.exp(-(scalar * scalar));
    }

    screenSpaceError(quadTree: QuadTree, tile: Tile): number {
        const camera = quadTree.camera;
        const maxGeometricError = this.getLevelMaximumGeometricError(tile.z);

        // Update distance of tile from camera
        if (camera.updatedLastFrame || !tile.distance) {
            tile.distance = tile.bbox.distanceToCamera(quadTree.camera);
        }

        const height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
        const sseDenominator = 2 * Math.tan(camera.fov * Math.PI / (2 * 180));

        let error = (maxGeometricError * height) / (tile.distance * sseDenominator);

        // TODO: Fof from Cesium
        // if (frameState.fog.enabled) {
        error = error - this.fog(tile.distance, 2.0e-4) * 2.0;
        // }

        return error;
    }

    getAABB(tile: Tile) {
        // FIXME: FC
        const width = 360.0 / this._tilingScheme.getNumberOfXTilesAtLevel(tile.z);
        const height = 180.0 / this._tilingScheme.getNumberOfYTilesAtLevel(tile.z);
        this._topLeftCartographicCorner.longitude = tile.x * width - 180.0;
        this._topLeftCartographicCorner.altitude = 0;
        this._topLeftCartographicCorner.latitude =  90.0 - tile.y * height;
        sphericalMercator.FCartographicToCartesian(this._topLeftCartographicCorner, topLeftCorner);

        this._bottomRightCartographicCorner.longitude = (tile.x + 1) * width - 180.0;
        this._bottomRightCartographicCorner.altitude = 0;
        this._bottomRightCartographicCorner.latitude = 90.0 - (tile.y + 1) * height;
        sphericalMercator.FCartographicToCartesian(this._bottomRightCartographicCorner, bottomRightCorner);

        return new AABB({ topLeftCorner, bottomRightCorner });
    }

    createRootTile(quadTree: QuadTree): Tile[] {
        const numberOfLevelZeroTilesX = this._tilingScheme.getNumberOfXTilesAtLevel(0);
        const numberOfLevelZeroTilesY = this._tilingScheme.getNumberOfYTilesAtLevel(0);

        const result: Tile[] = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);

        let index = 0;
        for (let y = 0; y < numberOfLevelZeroTilesY; ++y) {
            for (let x = 0; x < numberOfLevelZeroTilesX; ++x) {
                result[index++] = new this._instance({
                    x,
                    y,
                    z: 0,
                    quadTree,
                });
            }
        }

        return result;
    }

    protected abstract get _levelZeroMaximumGeometricError();

    get instance() { return this._instance; }
}
