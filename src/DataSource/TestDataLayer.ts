import * as THREE from 'three';
import { TestTile } from '../SceneMode/TestTile';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

export class TestDataLayer extends DataSourceLayer {
    static layerName = 'test';

    constructor() {
        super();
    }

    processData(tile: TestTile) {
        tile.data.status[TestDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: TestTile, error: Error) {
        throw new Error('Debug data can\'t be error.');
    }
}
