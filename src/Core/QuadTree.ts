import * as THREE from 'three';
import { Cartesian } from '../Math/Cartesian';
import { Camera } from '../Renderer/Camera';
import { OrbitControls } from '../Renderer/OrbitControls';
import { SceneMode } from '../SceneMode/SceneMode';
import { Tile, TileConstructor } from '../SceneMode/Tile';
import { GeometricHelper } from '../Utility/GeometricHelper';
import { Map3D } from './Map3D';
import { Pool } from './Pool';
import { TileReplacementQueue } from './TileReplacementQueue';
import { TilingScheme } from './TilingScheme';

export interface QuadTreeOptions {
    map: Map3D;
    mode: SceneMode;
    maximumScreenSpaceError?: number;
    tileCacheSize?: number;
}

export class QuadTree {
    _map: Map3D;

    scene: THREE.Scene;
    tiles: THREE.Group;

    camera: Camera;
    cameraController: OrbitControls;

    mode: SceneMode;

    _rootTile: Tile[];
    _activeTiles: Tile[];
    _tileLoadQueueHigh: Tile[];
    _tileLoadQueueMedium: Tile[];
    _tileLoadQueueLow: Tile[];

    _tileReplacementQueue: TileReplacementQueue;

    _loadQueueTimeSlice: number;

    maximumScreenSpaceError: number;

    tileCacheSize: number;

    maxDepth: number;

    _lastTileLoadQueueLength: number;

    needUpdate: boolean;
    updating: boolean;

    _debug: {
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

    _pool: Pool;

    constructor(options: QuadTreeOptions) {
        this._map = options.map;

        this.scene = options.map.scene;

        this.tiles = new THREE.Group();
        this.tiles.name = 'Tiles';
        this.scene.add(this.tiles);

        this.cameraController = options.map.cameraController;
        this.camera = options.map.camera;

        this._rootTile = options.mode.createRootTile(this);
        /**
         * Scene mode
         * @type {SceneMode}
         */
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

        this.updating = false;

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

    suspendLodUpdate(value) {
        this._debug.suspendLodUpdate = value;
    }

    update() {
        // If not thing need to update, do noting
        if (!this.needUpdate || this.updating || this._debug.suspendLodUpdate) {
            return;
        }
        this.needUpdate = false;
        this.updating = true;

        // Compute frustum of camera
        this.camera.update();

        clearTileLoadQueue(this);

        this._tileReplacementQueue.markStartOfRenderFrame();

        selectTilesForRendering(this);

        renderTiles(this, this._activeTiles);

        processTileLoadQueue(this);

        updateTileLoadProgress(this);

        this.camera.updatedLastFrame = false;
        this.updating = false;
    }
}

function clearTileLoadQueue(primitive: QuadTree) {
    const debug = primitive._debug;
    debug.maxDepth = 0;
    debug.tilesVisited = 0;
    debug.tilesCulled = 0;
    debug.tilesRendered = 0;
    debug.tilesWaitingForChildren = 0;

    primitive._tileLoadQueueHigh.length = 0;
    primitive._tileLoadQueueMedium.length = 0;
    primitive._tileLoadQueueLow.length = 0;
}

function selectTilesForRendering(primitive: QuadTree) {
    const debug = primitive._debug;

    // Clear the render list.
    const tilesToRender = primitive._activeTiles;
    tilesToRender.length = 0;

    // We can't render anything before the level zero tiles exist.
    // var tileProvider = primitive._tileProvider;

    let tile: Tile;
    const rootTiles = primitive._rootTile;

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
        primitive._tileReplacementQueue.markTileRendered(tile);
        if (!tile.renderable) {
            if (tile.needsLoading) {
                primitive._tileLoadQueueHigh.push(tile);
            }
            ++debug.tilesWaitingForChildren;
        } else if (computeTileVisibility(primitive, tile)) {
            visitTile(primitive, tile);
        } else {
            if (tile.needsLoading) {
                primitive._tileLoadQueueLow.push(tile);
            }
            ++debug.tilesCulled;
        }
    }
}

function visitTile(primitive: QuadTree, tile: Tile) {
    const debug = primitive._debug;

    ++debug.tilesVisited;

    primitive._tileReplacementQueue.markTileRendered(tile);

    if (tile.z > debug.maxDepth) {
        debug.maxDepth = tile.z;
    }

    if (primitive.mode.screenSpaceError(primitive, tile) < primitive.maximumScreenSpaceError) {
        // This tile meets SSE requirements, so render it.
        if (tile.needsLoading) {
            // Rendered tile meeting SSE loads with medium priority.
            primitive._tileLoadQueueMedium.push(tile);
        }
        addTileToRenderList(primitive, tile);
        return;
    }

    const allAreRenderable = tile.children[0].renderable && tile.children[1].renderable
        && tile.children[2].renderable && tile.children[3].renderable;
    const allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent &&
        tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;

    if (allAreRenderable) {
        if (allAreUpsampled) {
            // No point in rendering the children because they're all upsampled.  Render this tile instead.
            addTileToRenderList(primitive, tile);

            // Load the children even though we're (currently) not going to render them.
            // A tile that is "upsampled only" right now might change its tune once it does more loading.
            // A tile that is upsampled now and forever should also be done loading, so no harm done.
            queueChildLoadNearToFar(primitive, primitive.camera.target, tile.children);

            if (tile.needsLoading) {
                // Rendered tile that's not waiting on children loads with medium priority.
                primitive._tileLoadQueueMedium.push(tile);
            }
        } else {
            // SSE is not good enough and children are loaded, so refine.
            // No need to add the children to the load queue because
            // they'll be added (if necessary) when they're visited.
            visitVisibleChildrenNearToFar(primitive, tile.children);

            if (tile.needsLoading) {
                // Tile is not rendered, so load it with low priority.
                primitive._tileLoadQueueLow.push(tile);
            }
        }
    } else {
        // We'd like to refine but can't because not all of our children are
        // renderable.  Load the refinement blockers with high priority and
        // render this tile in the meantime.
        queueChildLoadNearToFar(primitive, primitive.camera.target, tile.children);
        addTileToRenderList(primitive, tile);

        if (tile.needsLoading) {
            // We will refine this tile when it's possible, so load this tile only with low priority.
            primitive._tileLoadQueueLow.push(tile);
        }
    }
}

function queueChildLoadNearToFar(primitive: QuadTree, cameraPosition: Cartesian, children: Tile[]) {
    if (cameraPosition.x < children[0].bbox.xMax) {
        if (cameraPosition.z < children[0].bbox.zMax) {
            // Camera in northwest quadrant
            queueChildTileLoad(primitive, children[0]);
            queueChildTileLoad(primitive, children[2]);
            queueChildTileLoad(primitive, children[1]);
            queueChildTileLoad(primitive, children[3]);
        } else {
            // Camera in southwest quadrant
            queueChildTileLoad(primitive, children[2]);
            queueChildTileLoad(primitive, children[0]);
            queueChildTileLoad(primitive, children[3]);
            queueChildTileLoad(primitive, children[1]);
        }
    } else if (cameraPosition.z < children[0].bbox.zMax) {
        // Camera northeast quadrant
        queueChildTileLoad(primitive, children[1]);
        queueChildTileLoad(primitive, children[3]);
        queueChildTileLoad(primitive, children[0]);
        queueChildTileLoad(primitive, children[2]);
    } else {
        // Camera in northeast quadrant
        queueChildTileLoad(primitive, children[3]);
        queueChildTileLoad(primitive, children[1]);
        queueChildTileLoad(primitive, children[2]);
        queueChildTileLoad(primitive, children[0]);
    }
}

function queueChildTileLoad(primitive: QuadTree, childTile: Tile) {
    // Tile is deeper than max stop
    if (childTile.z > primitive.maxDepth) {
        return;
    }

    primitive._tileReplacementQueue.markTileRendered(childTile);
    if (childTile.needsLoading) {
        if (childTile.renderable) {
            primitive._tileLoadQueueLow.push(childTile);
        } else {
            // A tile blocking refine loads with high priority
            primitive._tileLoadQueueHigh.push(childTile);
        }
    }
}

function visitVisibleChildrenNearToFar(primitive: QuadTree, children: Tile[]) {
    const distances = children.map((child) => {
        return { tile: child, distance: child.bbox.distanceFromPoint(primitive.camera.target) };
    });
    distances.sort((a, b) => {
        return a.distance - b.distance;
    });

    distances.forEach(({ tile }) => visitIfVisible(primitive, tile));
}

function computeTileVisibility(primitive: QuadTree, tile: Tile) {
    if (tile.z <= 6) {
        const camera = primitive.cameraController.camera;

        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const frustum = new THREE.Frustum().setFromMatrix(matrix);

        // TODO: using AABB to Culling
        return frustum.intersectsObject(tile.mesh);
    }

    let i;
    const corner = tile.bbox.corner;
    for (i = 0; i < 4; i++) {
        if (GeometricHelper.pointInsidePolygon(corner, primitive.camera.culledGroundPlane[i])) {
            return true;
        }
    }

    for (i = 0; i < 4; i++) {
        if (GeometricHelper.pointInsidePolygon(primitive.camera.culledGroundPlane, corner[i])) {
            return true;
        }
    }

    for (i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const l1 = [corner[i], corner[(i + 1) % 4]];
            const l2 = [primitive.camera.culledGroundPlane[j], primitive.camera.culledGroundPlane[(j + 1) % 4]];
            if (GeometricHelper.lineIntersects(l1, l2)) {
                return true;
            }
        }
    }
}

function visitIfVisible(primitive, tile) {
    if (computeTileVisibility(primitive, tile)) {
        visitTile(primitive, tile);
    } else {
        ++primitive._debug.tilesCulled;
        primitive._tileReplacementQueue.markTileRendered(tile);

        // We've decided this tile is not visible, but if it's not fully loaded yet, we've made
        // this determination based on possibly-incorrect information.  We need to load this
        // culled tile with low priority just in case it turns out to be visible after all.
        if (tile.needsLoading) {
            primitive._tileLoadQueueLow.push(tile);
        }
    }
}

function addTileToRenderList(primitive, tile) {
    primitive._activeTiles.push(tile);

    ++primitive._debug.tilesRendered;
}

function renderTiles(primitive: QuadTree, tiles: Tile[]) {
    if (tiles.length === 0) {
        return;
    }

    const pool = primitive._pool;

    while (tiles.length > pool.length) {
        pool.duplicate();
    }

    primitive.tiles.children.length = 0;

    const target = primitive.camera.target;

    tiles.forEach((tile) => {
        // Recalculate tile position
        const center = tile.bbox.center;
        const mesh = tile.mesh;

        mesh.position.set(center.x - target.x, center.y - target.y, center.z - target.z);
        tile.applyDataToMesh(mesh);

        primitive.tiles.add(mesh);
    });
}

function processTileLoadQueue(primitive: QuadTree) {
    const tileLoadQueueHigh = primitive._tileLoadQueueHigh;
    const tileLoadQueueMedium = primitive._tileLoadQueueMedium;
    const tileLoadQueueLow = primitive._tileLoadQueueLow;

    if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
        return;
    }

    // Remove any tiles that were not used this frame beyond the number
    // we're allowed to keep.
    primitive._tileReplacementQueue.trimTiles(primitive.tileCacheSize);

    const endTime = Date.now() + primitive._loadQueueTimeSlice;

    processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueHigh);
    processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueMedium);
    processSinglePriorityLoadQueue(primitive, endTime, tileLoadQueueLow);
}

function processSinglePriorityLoadQueue(primitive: QuadTree, endTime: number, loadQueue: Tile[]) {
    for (let i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
        const tile = loadQueue[i];
        primitive._tileReplacementQueue.markTileRendered(tile);

        primitive.mode.providers.forEach((provider) => provider.loadTile(tile));
    }
}

function updateTileLoadProgress(primitive) {
    const currentLoadQueueLength = primitive._tileLoadQueueHigh.length +
        primitive._tileLoadQueueMedium.length +
        primitive._tileLoadQueueLow.length;

    if (currentLoadQueueLength !== primitive._lastTileLoadQueueLength) {
        primitive._lastTileLoadQueueLength = currentLoadQueueLength;
    }

    const debug = primitive._debug;
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
