import * as THREE from 'three';
import { Cartesian } from '../Math/Cartesian';
import { Camera } from '../Renderer/Camera';
import { SceneMode } from '../SceneMode/SceneMode';
import { Tile } from '../SceneMode/Tile';
import { Map3D } from './Map3D';
import { Pool } from './Pool';
import { TileReplacementQueue } from './TileReplacementQueue';

export interface QuadTreeOptions {
    map: Map3D;
    mode: SceneMode;
    maximumScreenSpaceError?: number;
    tileCacheSize?: number;
}

export class QuadTree {scene: THREE.Scene;
    tiles: THREE.Group;

    public camera: Camera;

    public mode: SceneMode;

    private _rootTile: Tile[];
    private _activeTiles: Tile[];
    private _tileLoadQueueHigh: Tile[];
    private _tileLoadQueueMedium: Tile[];
    private _tileLoadQueueLow: Tile[];

    private _tileReplacementQueue: TileReplacementQueue;

    private _loadQueueTimeSlice: number;

    public maximumScreenSpaceError: number;

    public tileCacheSize: number;

    public maxDepth: number;

    private _lastTileLoadQueueLength: number;

    public needUpdate: boolean;

    private _debug: {
        enableDebugOutput: boolean;
        maxDepth: number;
        tilesVisited: number;
        tilesCulled: number;
        tilesRendered: number;
        tilesWaitingForChildren: number;
        lastMaxDepth: number;
        lastTilesVisited: number;
        lastTilesCulled: number;
        lastTilesRendered: number;
        lastTilesWaitingForChildren: number;
        suspendLodUpdate: boolean;
    };

    private _pool: Pool;

    constructor(options: QuadTreeOptions) {
        this.scene = options.map.scene;

        this.tiles = new THREE.Group();
        this.tiles.name = 'Tiles';
        this.scene.add(this.tiles);

        this.camera = options.map.camera;

        this._rootTile = options.mode.createRootTile(this);
        this.mode = options.mode;

        this._activeTiles = [];
        this._tileLoadQueueHigh = []; // high priority tiles are preventing refinement
        this._tileLoadQueueMedium = []; // medium priority tiles are being rendered
        this._tileLoadQueueLow = []; // low priority tiles were refined past or are non-visible parts of quads.

        this._tileReplacementQueue = new TileReplacementQueue();

        this._loadQueueTimeSlice = 5.0;

        this.maximumScreenSpaceError = options.maximumScreenSpaceError || 2;

        this.tileCacheSize = options.tileCacheSize || 256;

        this.maxDepth = 22;

        this._lastTileLoadQueueLength = 0;

        this.needUpdate = true;

        this._debug = {
            enableDebugOutput: true,

            maxDepth: 0,
            tilesVisited: 0,
            tilesCulled: 0,
            tilesRendered: 0,
            tilesWaitingForChildren: 0,

            lastMaxDepth: -1,
            lastTilesVisited: -1,
            lastTilesCulled: -1,
            lastTilesRendered: -1,
            lastTilesWaitingForChildren: -1,

            suspendLodUpdate: false,
        };

        this._pool = new Pool({
            instance: this.mode.instance,
        });
    }

    public suspendLodUpdate(value: boolean) {
        this._debug.suspendLodUpdate = value;
    }

    public update() {
        // If not thing need to update, do noting
        if (!this.needUpdate || this._debug.suspendLodUpdate) {
            return;
        }
        this.needUpdate = false;

        // Compute frustum of camera
        this.camera.update();

        this.clearTileLoadQueue();

        this._tileReplacementQueue.markStartOfRenderFrame();

        this.selectTilesForRendering();

        this.renderTiles(this._activeTiles);

        this.processTileLoadQueue();

        this.updateTileLoadProgress();

        this.camera.updatedLastFrame = false;
    }

    private clearTileLoadQueue() {
        const debug = this._debug;
        debug.maxDepth = 0;
        debug.tilesVisited = 0;
        debug.tilesCulled = 0;
        debug.tilesRendered = 0;
        debug.tilesWaitingForChildren = 0;
    
        this._tileLoadQueueHigh.length = 0;
        this._tileLoadQueueMedium.length = 0;
        this._tileLoadQueueLow.length = 0;
    }

    private selectTilesForRendering() {
        const debug = this._debug;
    
        // Clear the render list.
        const tilesToRender = this._activeTiles;
        tilesToRender.length = 0;
    
        // We can't render anything before the level zero tiles exist.
        // var tileProvider = primitive._tileProvider;
    
        let tile: Tile;
        const rootTiles = this._rootTile;
    
        // Our goal with load ordering is to first load all of the tiles we need to
        // render the current scene at full detail.  Loading any other tiles is just
        // a form of prefetching, and we need not do it at all (other concerns aside).  This
        // simple and obvious statement gets more complicated when we realize that, because
        // we don't have bounding volumes for the entire terrain tile pyramid, we don't
        // precisely know which tiles we need to render the scene at full detail, until we do
        // some loading.
        //
        // So our load priority is (from high to low):
        // 1. Tiles that we _would_ render, except that they're not sufficiently loaded yet.
        //    Ideally this would only include tiles that we've already determined to be visible,
        //    but since we don't have reliable visibility information until a tile is loaded,
        //    and because we (currently) must have all children in a quad renderable before we
        //    can refine, this pretty much means tiles we'd like to refine to, regardless of
        //    visibility. (high)
        // 2. Tiles that we're rendering. (medium)
        // 3. All other tiles. (low)
        //
        // Within each priority group, tiles should be loaded in approximate near-to-far order,
        // but currently they're just loaded in our traversal order which makes no guarantees
        // about depth ordering.
    
        // Traverse in depth-first, near-to-far order.
        for (let i = 0, len = rootTiles.length; i < len; ++i) {
            tile = rootTiles[i];
            this._tileReplacementQueue.markTileRendered(tile);
            if (!tile.renderable) {
                if (tile.needsLoading) {
                    this._tileLoadQueueHigh.push(tile);
                }
                ++debug.tilesWaitingForChildren;
            } else if (this.computeTileVisibility(tile)) {
                this.visitTile(tile);
            } else {
                if (tile.needsLoading) {
                    this._tileLoadQueueLow.push(tile);
                }
                ++debug.tilesCulled;
            }
        }
    }

    private visitTile(tile: Tile) {
        const debug = this._debug;
    
        ++debug.tilesVisited;
    
        this._tileReplacementQueue.markTileRendered(tile);
    
        if (tile.z > debug.maxDepth) {
            debug.maxDepth = tile.z;
        }
    
        if (this.mode.screenSpaceError(this, tile) < this.maximumScreenSpaceError) {
            // This tile meets SSE requirements, so render it.
            if (tile.needsLoading) {
                // Rendered tile meeting SSE loads with medium priority.
                this._tileLoadQueueMedium.push(tile);
            }
            this.addTileToRenderList(tile);
            return;
        }
    
        const allAreRenderable = tile.children[0].renderable && tile.children[1].renderable
            && tile.children[2].renderable && tile.children[3].renderable;
        const allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent &&
            tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;
    
        if (allAreRenderable) {
            if (allAreUpsampled) {
                // No point in rendering the children because they're all upsampled.  Render this tile instead.
                this.addTileToRenderList(tile);
    
                // Load the children even though we're (currently) not going to render them.
                // A tile that is "upsampled only" right now might change its tune once it does more loading.
                // A tile that is upsampled now and forever should also be done loading, so no harm done.
                this.queueChildLoadNearToFar(this.camera.target, tile.children);
    
                if (tile.needsLoading) {
                    // Rendered tile that's not waiting on children loads with medium priority.
                    this._tileLoadQueueMedium.push(tile);
                }
            } else {
                // SSE is not good enough and children are loaded, so refine.
                // No need to add the children to the load queue because
                // they'll be added (if necessary) when they're visited.
                this.visitVisibleChildrenNearToFar(tile.children);
    
                if (tile.needsLoading) {
                    // Tile is not rendered, so load it with low priority.
                    this._tileLoadQueueLow.push(tile);
                }
            }
        } else {
            // We'd like to refine but can't because not all of our children are
            // renderable.  Load the refinement blockers with high priority and
            // render this tile in the meantime.
            this.queueChildLoadNearToFar(this.camera.target, tile.children);
            this.addTileToRenderList(tile);
    
            if (tile.needsLoading) {
                // We will refine this tile when it's possible, so load this tile only with low priority.
                this._tileLoadQueueLow.push(tile);
            }
        }
    }

    private queueChildLoadNearToFar(cameraPosition: Cartesian, children: Tile[]) {
        if (cameraPosition.x < children[0].bbox.max.x) {
            if (cameraPosition.z < children[0].bbox.max.z) {
                // Camera in northwest quadrant
                this.queueChildTileLoad(children[0]);
                this.queueChildTileLoad(children[2]);
                this.queueChildTileLoad(children[1]);
                this.queueChildTileLoad(children[3]);
            } else {
                // Camera in southwest quadrant
                this.queueChildTileLoad(children[2]);
                this.queueChildTileLoad(children[0]);
                this.queueChildTileLoad(children[3]);
                this.queueChildTileLoad(children[1]);
            }
        } else if (cameraPosition.z < children[0].bbox.max.z) {
            // Camera northeast quadrant
            this.queueChildTileLoad(children[1]);
            this.queueChildTileLoad(children[3]);
            this.queueChildTileLoad(children[0]);
            this.queueChildTileLoad(children[2]);
        } else {
            // Camera in northeast quadrant
            this.queueChildTileLoad(children[3]);
            this.queueChildTileLoad(children[1]);
            this.queueChildTileLoad(children[2]);
            this.queueChildTileLoad(children[0]);
        }
    }

    private queueChildTileLoad(childTile: Tile) {
        // Tile is deeper than max stop
        if (childTile.z > this.maxDepth) {
            return;
        }
    
        this._tileReplacementQueue.markTileRendered(childTile);
        if (childTile.needsLoading) {
            if (childTile.renderable) {
                this._tileLoadQueueLow.push(childTile);
            } else {
                // A tile blocking refine loads with high priority
                this._tileLoadQueueHigh.push(childTile);
            }
        }
    }

    private visitVisibleChildrenNearToFar(children: Tile[]) {
        const distances = children.map((child) => {
            return { tile: child, distance: child.bbox.distanceToPoint(this.camera.target) };
        });
        distances.sort((a, b) => {
            return a.distance - b.distance;
        });
    
        distances.forEach(({ tile }) => this.visitIfVisible(tile));
    }

    private computeTileVisibility(tile: Tile) {
        const camera = this.camera;

        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const frustum = new THREE.Frustum().setFromMatrix(matrix);

        // TODO: using AABB to Culling
        return frustum.intersectsBox(tile.bbox);
    }

    private visitIfVisible(tile: Tile) {
        if (this.computeTileVisibility(tile)) {
            this.visitTile(tile);
        } else {
            ++this._debug.tilesCulled;
            this._tileReplacementQueue.markTileRendered(tile);
    
            // We've decided this tile is not visible, but if it's not fully loaded yet, we've made
            // this determination based on possibly-incorrect information.  We need to load this
            // culled tile with low priority just in case it turns out to be visible after all.
            if (tile.needsLoading) {
                this._tileLoadQueueLow.push(tile);
            }
        }
    }

    private addTileToRenderList(tile: Tile) {
        this._activeTiles.push(tile);
    
        ++this._debug.tilesRendered;
    }

    private renderTiles(tiles: Tile[]) {
        if (tiles.length === 0) {
            return;
        }
    
        const pool = this._pool;
    
        while (tiles.length > pool.length) {
            pool.duplicate();
        }
    
        this.tiles.children.length = 0;
    
        const target = this.camera.target;
    
        tiles.forEach((tile) => {
            // Recalculate tile position
            const center = tile.bbox.center;
            const mesh = tile.mesh;
    
            mesh.position.set(center.x - target.x, center.y - target.y, center.z - target.z);
            tile.applyDataToMesh(mesh);
    
            this.tiles.add(mesh);
        });
    }

    private processTileLoadQueue() {
        const tileLoadQueueHigh = this._tileLoadQueueHigh;
        const tileLoadQueueMedium = this._tileLoadQueueMedium;
        const tileLoadQueueLow = this._tileLoadQueueLow;
    
        if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
            return;
        }
    
        // Remove any tiles that were not used this frame beyond the number
        // we're allowed to keep.
        this._tileReplacementQueue.trimTiles(this.tileCacheSize);
    
        const endTime = Date.now() + this._loadQueueTimeSlice;
    
        this.processSinglePriorityLoadQueue(endTime, tileLoadQueueHigh);
        this.processSinglePriorityLoadQueue(endTime, tileLoadQueueMedium);
        this.processSinglePriorityLoadQueue(endTime, tileLoadQueueLow);
    }

    private processSinglePriorityLoadQueue(endTime: number, loadQueue: Tile[]) {
        for (let i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
            const tile = loadQueue[i];
            this._tileReplacementQueue.markTileRendered(tile);
    
            this.mode.providers.forEach((provider) => provider.loadTile(tile));
        }
    }

    private updateTileLoadProgress() {
        const currentLoadQueueLength = this._tileLoadQueueHigh.length +
            this._tileLoadQueueMedium.length +
            this._tileLoadQueueLow.length;
    
        if (currentLoadQueueLength !== this._lastTileLoadQueueLength) {
            this._lastTileLoadQueueLength = currentLoadQueueLength;
        }
    
        const debug = this._debug;
        if (debug.enableDebugOutput && !debug.suspendLodUpdate) {
            if (debug.tilesVisited !== debug.lastTilesVisited ||
                debug.tilesRendered !== debug.lastTilesRendered ||
                debug.tilesCulled !== debug.lastTilesCulled ||
                debug.maxDepth !== debug.lastMaxDepth ||
                debug.tilesWaitingForChildren !== debug.lastTilesWaitingForChildren) {
                console.info('Visited ' + debug.tilesVisited + ', Rendered: ' + debug.tilesRendered +
                    ', Culled: ' + debug.tilesCulled + ', Max Depth: ' + debug.maxDepth +
                    ', Waiting for children: ' + debug.tilesWaitingForChildren);
    
                debug.lastTilesVisited = debug.tilesVisited;
                debug.lastTilesRendered = debug.tilesRendered;
                debug.lastTilesCulled = debug.tilesCulled;
                debug.lastMaxDepth = debug.maxDepth;
                debug.lastTilesWaitingForChildren = debug.tilesWaitingForChildren;
            }
        }
    }
}
