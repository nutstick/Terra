import { QuadTree } from '../Core/QuadTree';
import { TilingScheme } from '../Core/TilingScheme';
import { Provider } from '../DataSource/Provider';
import { Tile, TileConstructor } from './Tile';

export interface SceneModeOptions {
    instance: TileConstructor;
}

export abstract class SceneMode {
    providers: Provider[];
    _tilingScheme: TilingScheme;
    _instance: TileConstructor;

    constructor(options: SceneModeOptions) {
        this._instance = options.instance;
    }

    getLevelMaximumGeometricError = function(level) {
        return this._levelZeroMaximumGeometricError / (1 << level);
    };

    screenSpaceError(quadTree: QuadTree, tile: Tile): number {
        const camera = quadTree.camera;
        const maxGeometricError = this.getLevelMaximumGeometricError(tile.z);

        // Update distance of tile from camera
        if (camera.updatedLastFrame || !tile.distance) {
            tile.distance = tile.bbox.distanceToCamera(quadTree.camera);
        }

        const height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
        const sseDenominator = 2 * Math.tan(camera.fov * Math.PI / (2 * 180));

        const error = (maxGeometricError * height) / (tile.distance * sseDenominator);

        // TODO: Fof from Cesium
        // if (frameState.fog.enabled) {
        //  error = error - CesiumMath.fog(distance, frameState.fog.density) * frameState.fog.sse;
        // }

        return error;
    }

    abstract get _levelZeroMaximumGeometricError();
}
