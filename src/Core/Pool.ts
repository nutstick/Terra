import * as THREE from 'three';
import { TileConstructor } from '../SceneMode/Tile';

export interface PoolOptions {
    instance: TileConstructor;
    size?: number;
}

export class Pool {
    _length: number;
    _usingNodes: { [key: string]: THREE.Mesh };
    _freeNodes: THREE.Mesh[];
    create: () => THREE.Mesh;

    constructor(options: PoolOptions) {
        this._length = options.size || 16;
        this._usingNodes = {};
        this._freeNodes = [];

        this.create = options.instance.createMesh;

        for (let i = 0; i < this._length; i++) {
            this._freeNodes.push(this.create());
        }
    }
    duplicate() {
        const length = this._length;
        for (let i = 0; i < length; i++) {
            this._freeNodes.push(this.create());
        }
        this._length *= 2;
    }
    get(index: string) {
        if (!this._usingNodes[index]) {
            throw new Error(`${index} isn't in used.`);
        }
        return this._usingNodes[index];
    }
    use(index: string) {
        const node = this._freeNodes.pop();
        this._usingNodes[index] = node;
        return node;
    }
    free(index: string) {
        const node = this._usingNodes[index];
        delete this._usingNodes[index];
        this._freeNodes.push(node);
    }

    get length() {
        return this._length;
    }
}
