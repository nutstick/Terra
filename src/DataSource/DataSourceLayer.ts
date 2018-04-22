import { Tile } from '../SceneMode/Tile';

export interface DataSourceLayerConstructor {
    new (): DataSourceLayer;

    layerName;
}

export abstract class DataSourceLayer {
    static layerName = 'none';

    abstract processError(tile: Tile, error: any);
    abstract processData(tile: Tile, data: any);
}
