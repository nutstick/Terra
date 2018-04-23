import * as THREE from 'three';
import { DataSource } from '../DataSource/DataSource';
import { EPSG4326MapImageDataLayer } from '../DataSource/EPSG4326MapImageDataLayer';
import { TestDataLayer } from '../DataSource/TestDataLayer';
import { Tile, TileOptions } from '../SceneMode/Tile';

export interface Tile2DOptions extends TileOptions {}

const image = new Image();
export class TestTile extends Tile {
    private static dataLayers = DataSource.toLayers([EPSG4326MapImageDataLayer]);

    private _material: THREE.Material;
    public data: DataSource;

    constructor(options: Tile2DOptions) {
        super(options);
        this.data = new DataSource({
            layers: TestTile.dataLayers,
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
        // const tileSize = Tile.size(this.z);

        // mesh.scale.set(tileSize / 2, 1, tileSize);
        const tileSize = Tile.size(this.z);

        mesh.material = this._material;

        mesh.scale.set(tileSize / 2, 10, tileSize);
    }

    dispose() {
        super.dispose();
    }

    get material() { return this._material; }
    set material(m) { this._material = m; }
}
