import { MapSettings } from '../Core/MapSettings';
import { QuadTree } from '../Core/QuadTree';
import { DataSource } from '../DataSource/DataSource';
import { AABB } from '../Math/AABB';

export interface TileOptions {
    x: number;
    y: number;
    z: number;
    quadTree: QuadTree;
    parent?: Tile;
}

export interface TileConstructor {
    new (options: TileOptions): Tile;
    createMesh();
}

const size = Array.apply(null, Array(32)).map((_, idx) => {
    return MapSettings.basePlaneDimension / Math.pow(2, idx);
});

export abstract class Tile {
    static State = {
        Start: 0,
        Loading: 1,
        Done: 2,
        Failed: 3,
        Removed: 4,
    };

    private _x: number;
    private _y: number;
    private _z: number;
    private _quadTree: QuadTree;
    private _parent: Tile;
    private _state: number;
    private _replacementPrevious: Tile;
    private _replacementNext: Tile;
    private _distance: number;
    private _bbox: AABB;
    upsampledFromParent: boolean;

    private _children: Tile[];

    private _mesh: THREE.Mesh;

    constructor(options: TileOptions) {
        this._x = options.x;
        this._y = options.y;
        this._z = options.z;
        this._quadTree = options.quadTree;
        // QuadTreeTile structure
        this._parent = options.parent;
        // State
        this._state = Tile.State.Start;

        this._replacementPrevious = undefined;
        this._replacementNext = undefined;
        this._distance = undefined;
        this._bbox = undefined;
        this.upsampledFromParent = false;

        this._mesh = (this.constructor as TileConstructor).createMesh();
    }

    static createMesh() {
        throw new Error('No createMesh in abstract Tile.');
    }
    abstract applyDataToMesh(mesh: THREE.Mesh): void;

    dispose() {
        // Remove link betweem parent
        if (this._parent) {
            for (let i = 0; i < 4; i++) {
                if (this._parent._children[i] && this.stringify === this._parent._children[i].stringify) {
                    this._parent._children[i] = undefined;
                }
            }
        }
        this._parent = undefined;
        this._state = Tile.State.Removed;
        this._bbox = undefined;
        this.upsampledFromParent = false;
        this.data.dispose();

        if (this._children) {
            for (let j = 0; j < 4; ++j) {
                if (this._children[j]) {
                    this._children[j].dispose();
                    this._children[j] = undefined;
                }
            }
        }
        this._quadTree = undefined;
    }

    static size(z) {
        return size[z];
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    get parent() { return this._parent; }
    get children() {
        if (typeof this._children === 'undefined') {
            this._children = new Array(4);
        }

        // FIXME: Type of instance
        const Instance: TileConstructor = (this.constructor as any);

        for (let i = 0; i < 4; ++i) {
            if (typeof this._children[i] === 'undefined') {
                this._children[i] = new Instance({
                    x: this._x * 2 + i % 2,
                    // Rounding float to integer ex. ~~2.5 = 2
                    y: this._y * 2 + (~~(i / 2)) % 2,
                    z: this._z + 1,
                    parent: this,
                    quadTree: this._quadTree,
                });
            }
        }

        return this._children;
    }
    get replacementPrevious() { return this._replacementPrevious; }
    set replacementPrevious(tile) { this._replacementPrevious = tile; }
    get replacementNext() { return this._replacementNext; }
    set replacementNext(tile) { this._replacementNext = tile; }
    get distance() { return this._distance; }
    set distance(distance) { this._distance = distance; }
    get bbox() {
        if (!this._bbox) {
            this._bbox = this._quadTree.mode.getAABB(this);
        }

        return this._bbox;
    }
    get quadTree() { return this._quadTree; }
    /************************
     * State handling
     ***********************/
    get state() { throw new Error('derpercate'); }
    get needsLoading() { return this.data.needsLoading; }
    get renderable() { return this.data.done; }
    get eligibleForUnloading() { return true; }
    get disposed() { return this._state === Tile.State.Removed; }
    get stringify() { return this._x + '/' + this._y + '/' + this._z; }

    abstract get data(): DataSource;

    get mesh(): THREE.Mesh {
        return this._mesh;
    }
}
