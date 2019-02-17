import * as THREE from 'three';
import { Vector2 } from 'three';
import { TerrainTile } from '../SceneMode/TerrainTile';
import { Tile } from '../SceneMode/Tile';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

const vertices = 256;
const segments = vertices - 1;
const imageSize = 256;

export class TerrainRGBDataLayer extends DataSourceLayer {
    static layerName = 'terrain';

    constructor() {
        super();
    }

    processLoading(tile: TerrainTile) {
        tile.data.status[TerrainRGBDataLayer.layerName] = DataSource.State.Loading;
    }

    processData(tile: TerrainTile, data: any) {
        const tileSize = Tile.size(tile.z);
        tile.geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize, segments / 2, segments / 2);

        const elevations = [];
        for (let e = 0; e < data.length; e += 4) {
            const R = data[e];
            const G = data[e + 1];
            const B = data[e + 2];

            const i = e / 4;
            const posX = (i % imageSize) - tileSize / 2;
            const elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1);
            const posZ = ((i - i % imageSize) / imageSize) - tileSize / 2;
            // elevation *= 10;
            elevations.push(posX, elevation, posZ);
        }

        // console.log(tile.geometry, elevations);
        (tile.geometry.attributes as any).position.array = new Float32Array(elevations);
        (tile.geometry.attributes as any).position.needsUpdate = true;
        tile.data.status[TerrainRGBDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: TerrainTile, error: Error) {
        const elevations = [];

        for (let e = 0; e < imageSize * imageSize; e++) {
            const posX = (e % imageSize) - 127;
            const posZ = (e / imageSize) - 127;
            elevations.push(posX, 0, posZ);
        }

        tile.geometry = new THREE.PlaneBufferGeometry(vertices, vertices, segments, segments);
        (tile.geometry.attributes as any).position.array = new Float32Array(elevations);

        tile.data.status[TerrainRGBDataLayer.layerName] = DataSource.State.Idle;
    }
}
