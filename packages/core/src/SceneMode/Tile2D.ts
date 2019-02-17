import * as THREE from 'three';
import { DataSource } from '../DataSource/DataSource';
import { ImageDataLayer } from '../DataSource/ImageDataLayer';
import { Tile, TileOptions } from './Tile';

export interface Tile2DOptions extends TileOptions {}

const image = new Image();
export class Tile2D extends Tile {
    public static dataLayers = DataSource.toLayers([ImageDataLayer]);

    public data: DataSource;
    private _material: THREE.Material;

    constructor(options: Tile2DOptions) {
        super(options);
        this.data = new DataSource({
            layers: Tile2D.dataLayers,
            tile: this,
        });
    }

    static createMesh() {
        const material = null;

        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        return new THREE.Mesh(geometry, material);
    }

    applyDataToMesh(mesh: THREE.Mesh) {
        const tileSize = Tile.size(this.z);

        mesh.scale.set(tileSize, 1, tileSize);

        if (!this._material) {
            throw new Error(`Material not ready to use. ${this.stringify}`);
        }
        mesh.material = this._material;
    }

    dispose() {
        super.dispose();
        if (this._material) {
            this._material.dispose();
        }
        this._material = undefined;
    }

    get material() { return this._material; }
    set material(m: THREE.Material) { this._material = m; }
}
