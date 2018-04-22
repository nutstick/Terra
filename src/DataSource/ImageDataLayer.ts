import * as THREE from 'three';
import { Tile2D } from '../SceneMode/Tile2D';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

export class ImageDataLayer extends DataSourceLayer {
    static layerName = 'texture';

    constructor() {
        super();
    }

    processData(tile: Tile2D, data: THREE.Texture) {
        if (tile.material) {
            throw new Error('Material\'s already set up.');
        }
        tile.material = new THREE.MeshBasicMaterial({
            map: data,
        });

        tile.data.status[ImageDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: Tile2D, error: Error) {
        tile.data.status[ImageDataLayer.layerName] = DataSource.State.Idle;
    }
}
