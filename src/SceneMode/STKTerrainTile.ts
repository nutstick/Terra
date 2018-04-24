import * as THREE from 'three';
import { DataSource } from '../DataSource/DataSource';
import { EPSG4326MapImageDataLayer } from '../DataSource/EPSG4326MapImageDataLayer';
import { STKTerrainDataLayer } from '../DataSource/STKTerrainDataLayer';
import { TestDataLayer } from '../DataSource/TestDataLayer';
import { Tile, TileOptions } from '../SceneMode/Tile';

export interface STKTerrainTileOptions extends TileOptions {}

const image = new Image();
export class STKTerrainTile extends Tile {
    static dataLayers = DataSource.toLayers([
        EPSG4326MapImageDataLayer,
        STKTerrainDataLayer,
    ]);

    public data: DataSource;
    private _material: THREE.Material;
    private _geometry: THREE.Geometry;

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

        const geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);

        return new THREE.Mesh(geometry, material);
    }

    applyDataToMesh(mesh: THREE.Mesh) {
        const tileSize = Tile.size(this.z);

        mesh.material = this._material;

        mesh.scale.set(
            this.bbox.width,
            1,
            this.bbox.height,
        );

        mesh.geometry = this._geometry;

        mesh.position.y = this.bbox.yMin;
    }

    dispose() {
        super.dispose();
    }

    get geometry() { return this._geometry; }
    set geometry(g) { this._geometry = g; }
    get material() { return this._material; }
    set material(m) { this._material = m; }
}
