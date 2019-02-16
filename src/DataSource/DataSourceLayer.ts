import { Tile } from '../SceneMode/Tile';

export interface DataSourceLayerConstructor {
    new (): DataSourceLayer;

    layerName;
}

export abstract class DataSourceLayer {
    static layerName = 'none';

    abstract processLoading(tile: Tile);
    abstract processData(tile: Tile, data: any);
    abstract processError(tile: Tile, error: any);
}
