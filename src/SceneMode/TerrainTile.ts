import * as THREE from 'three';
import { DataSource } from '../DataSource/DataSource';
import { EPSG4326MapImageDataLayer } from '../DataSource/EPSG4326MapImageDataLayer';
import { ImageDataLayer } from '../DataSource/ImageDataLayer';
import { TerrainRGBDataLayer } from '../DataSource/TerrainRGBDataLayer';
import { TestDataLayer } from '../DataSource/TestDataLayer';
import { Tile, TileOptions } from '../SceneMode/Tile';

export interface TerrainTileOptions extends TileOptions {}

const image = new Image();
export class TerrainTile extends Tile {
    private static dataLayers = DataSource.toLayers([ImageDataLayer, TerrainRGBDataLayer]);

    private _geometry: THREE.BufferGeometry;
    private _material: THREE.Material;
    public data: DataSource;

    constructor(options: TerrainTileOptions) {
        super(options);
        this.data = new DataSource({
            layers: TerrainTile.dataLayers,
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

        mesh.material = this.material;

        mesh.scale.set(1, 1, 1);

        mesh.geometry = this.geometry;
    }

    dispose() {
        super.dispose();
        if (this._geometry) {
            this._geometry = undefined;
        }
        if (this._material) {
            this._material = undefined;
        }
    }

    get material() { return this._material; }
    set material(m) { this._material = m; }
    get geometry() { return this._geometry; }
    set geometry(m) { this._geometry = m; }
}
