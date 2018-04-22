import * as THREE from 'three';
import { DataSource } from '../DataSource/DataSource';
import { ImageDataLayer } from '../DataSource/ImageDataLayer';
import { STKTerrainDataLayer } from '../DataSource/STKTerrainDataLayer';
import { TestDataLayer } from '../DataSource/TestDataLayer';
import { Tile, TileOptions } from '../SceneMode/Tile';

export interface STKTerrainTileOptions extends TileOptions {}

const image = new Image();
export class STKTerrainTile extends Tile {
    static dataLayers = DataSource.toLayers([ImageDataLayer, STKTerrainDataLayer]);

    public data: DataSource;

    constructor(options: STKTerrainTileOptions) {
        super(options);
        this.data = new DataSource({
            layers: STKTerrainTile.dataLayers,
            tile: this,
        });
    }

    static createMesh() {
        const material = new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity: 0,
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        return new THREE.Mesh(geometry, material);
    }

    applyDataToMesh(mesh: THREE.Mesh) {
        const tileSize = Tile.size(this.z);

        mesh.scale.set(tileSize, 1, tileSize);
    }

    dispose() {
        super.dispose();
    }
}
