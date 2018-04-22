import * as THREE from 'three';
import { STKTerrainTile } from '../SceneMode/STKTerrainTile';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

export class STKTerrainDataLayer extends DataSourceLayer {
    static layerName = 'terrain-stk';

    constructor() {
        super();
    }

    processData(tile: STKTerrainTile) {
        tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: STKTerrainTile, error: Error) {
        throw new Error('Debug data can\'t be error.');
    }
}
