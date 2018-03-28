var TileReplacementQueue = require('./TileReplacementQueue');
var sphericalMercator = require('../Utility/SphericalMercator');

/**
 * QuadTree class
 * @alias QuadTree
 * @constructor
 *
 * @param {Object} options
 * @param {Map} options.map - Map
 * @param {SceneMode} options.mode - Scene2D | Scene3D
 */
function QuadTree (options) {
    if (!options) throw new Error('No option provided');
    if (!options.map) throw new Error('No option.map provided');
    if (!options.mode) throw new Error('No options.mode provided');

    this.scene = options.map.scene;
    /**
     * Tile group
     * @type {THREE.Group}
     */
    this.tiles = new THREE.Group();
    this.tiles.name = 'Tiles';
    this.scene.add(this.tiles);

    this.cameraController = options.map.cameraController;

    this._rootTile = undefined;
    /**
     * Scene mode
     * @type {SceneMode}
     */
    this.mode = options.mode;
    this.mode.quadTree = this;
    // console.log(this.tiles.children.map((t) => t.tile.stringify));

    /**
     * Active tiles on screen
     * @type {Tile[]}
     */
    this._activeTiles = [];
    this._tileLoadQueueHigh = []; // high priority tiles are preventing refinement
    this._tileLoadQueueMedium = []; // medium priority tiles are being rendered
    this._tileLoadQueueLow = []; // low priority tiles were refined past or are non-visible parts of quads.

    /**
     * @type {TileReplacementQueue}
     */
    this._tileReplacementQueue = new TileReplacementQueue();

    this._levelZeroTiles = undefined;
    this._loadQueueTimeSlice = 5.0;

    this._addHeightCallbacks = [];
    this._removeHeightCallbacks = [];

    this._tileToUpdateHeights = [];
    this._lastTileIndex = 0;
    this._updateHeightsTimeSlice = 2.0;

    this.maximumScreenSpaceError = options.maximumScreenSpaceError || 2;

    this.tileCacheSize = options.tileCacheSize || 128;

    this.maxDepth = 30;

    this._lastTileLoadQueueLength = 0;

    /**
     * Need update flag
     * @type {boolean}
     */
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

        suspendLodUpdate: false
    };
}

QuadTree.prototype.suspendLodUpdate = function (value) {
    this._debug.suspendLodUpdate = value;
};

QuadTree.prototype.update = function () {
    // If not thing need to update, do noting
    if (!this.needUpdate || this.updating) return;
    this.needUpdate = false;
    this.updating = true;

    // Update Camera
    sphericalMercator.PixelToCartographic(this.cameraController.target, this.cameraController.targetCartographic);
    sphericalMercator.PixelToCartesian(this.cameraController.target, this.cameraController.targetCartesian);

    clearTileLoadQueue(this);

    this._tileReplacementQueue.markStartOfRenderFrame();

    this._activeTiles.forEach(function (tile) {
        tile.active = false;
    });
    selectTilesForRendering(this);

    this._activeTiles.forEach(function (tile) {
        tile.active = true;
    });

    processTileLoadQueue(this);
    updateTileLoadProgress(this);

    this.cameraController.object.updatedLastFrame = false;
    this.updating = false;

    console.log(this._tileReplacementQueue.count)
};

function clearTileLoadQueue (primative) {
    var debug = primative._debug;
    debug.maxDepth = 0;
    debug.tilesVisited = 0;
    debug.tilesCulled = 0;
    debug.tilesRendered = 0;
    debug.tilesWaitingForChildren = 0;

    primative._tileLoadQueueHigh.length = 0;
    primative._tileLoadQueueMedium.length = 0;
    primative._tileLoadQueueLow.length = 0;
}

function selectTilesForRendering (primative) {
    var debug = primative._debug;
    if (debug.suspendLodUpdate) {
        return;
    }

    // Clear the render list.
    var tilesToRender = primative._activeTiles;
    tilesToRender.length = 0;

    // We can't render anything before the level zero tiles exist.
    // var tileProvider = primative._tileProvider;

    var tile;
    var rootTiles = primative._rootTile;

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
    for (var i = 0, len = rootTiles.length; i < len; ++i) {
        tile = rootTiles[i];
        primative._tileReplacementQueue.markTileRendered(tile);
        if (!tile.renderable) {
            if (tile.needsLoading) {
                primative._tileLoadQueueHigh.push(tile);
            }
            ++debug.tilesWaitingForChildren;
        } else if (computeTileVisibility(primative, tile)) {
            visitTile(primative, tile);
        } else {
            if (tile.needsLoading) {
                primative._tileLoadQueueLow.push(tile);
            }
            ++debug.tilesCulled;
        }
    }
}

/**
 * @param {QuadTree} primative - QuadTree
 * @param {Tile} tile - Tile
 */
function visitTile (primative, tile) {
    var debug = primative._debug;

    ++debug.tilesVisited;

    primative._tileReplacementQueue.markTileRendered(tile);

    if (tile.z > debug.maxDepth) {
        debug.maxDepth = tile.z;
    }

    if (primative.mode.screenSpaceError(primative, tile) < primative.maximumScreenSpaceError) {
        // This tile meets SSE requirements, so render it.
        if (tile.needsLoading) {
            // Rendered tile meeting SSE loads with medium priority.
            primative._tileLoadQueueMedium.push(tile);
        }
        addTileToRenderList(primative, tile);
        return;
    }
    var allAreRenderable = tile.children[0].renderable && tile.children[1].renderable && tile.children[2].renderable && tile.children[3].renderable;
    var allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent &&
        tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;
    if (allAreRenderable) {
        if (allAreUpsampled) {
            // No point in rendering the children because they're all upsampled.  Render this tile instead.
            addTileToRenderList(primative, tile);

            // Load the children even though we're (currently) not going to render them.
            // A tile that is "upsampled only" right now might change its tune once it does more loading.
            // A tile that is upsampled now and forever should also be done loading, so no harm done.
            queueChildLoadNearToFar(primative, primative.cameraController.targetCartesian, tile.children);

            if (tile.needsLoading) {
                // Rendered tile that's not waiting on children loads with medium priority.
                primative._tileLoadQueueMedium.push(tile);
            }
        } else {
            // SSE is not good enough and children are loaded, so refine.
            // No need to add the children to the load queue because they'll be added (if necessary) when they're visited.
            visitVisibleChildrenNearToFar(primative, tile.children);

            if (tile.needsLoading) {
                // Tile is not rendered, so load it with low priority.
                primative._tileLoadQueueLow.push(tile);
            }
        }
    } else {
        // We'd like to refine but can't because not all of our children are renderable.  Load the refinement blockers with high priority and
        // render this tile in the meantime.
        queueChildLoadNearToFar(primative, primative.cameraController.targetCartesian, tile.children);
        addTileToRenderList(primative, tile);

        if (tile.needsLoading) {
            // We will refine this tile when it's possible, so load this tile only with low priority.
            primative._tileLoadQueueLow.push(tile);
        }
    }
}

function queueChildLoadNearToFar (primative, cameraPosition, children) {
    var distances = children.map(function (child) {
        return { tile: child, distance: child.bbox.distanceFromPoint(cameraPosition) };
    });

    distances.sort(function (a, b) {
        return a.distance - b.distance;
    });

    distances.forEach(function (child, index) {
        queueChildTileLoad(primative, child.tile);
    });
}

function queueChildTileLoad (primative, childTile) {
    if (childTile.z > primative.maxDepth) {
        return;
    }

    primative._tileReplacementQueue.markTileRendered(childTile);
    if (childTile.needsLoading) {
        if (childTile.renderable) {
            primative._tileLoadQueueLow.push(childTile);
        } else {
            // A tile blocking refine loads with high priority
            primative._tileLoadQueueHigh.push(childTile);
        }
    }
}

function visitVisibleChildrenNearToFar (primative, children) {
    var cameraPosition = primative.cameraController.target;
    var distances = children.map(function (child) {
        return { tile: child, distance: child.bbox.distanceFromPoint(cameraPosition) };
    });
    distances.sort(function (a, b) {
        return a.distance - b.distance;
    });

    for (var i = 0; i < distances.length; ++i) {
        visitIfVisible(primative, distances[i].tile);
    };
}

function computeTileVisibility (primative, tile, debug) {
    var camera = primative.cameraController.object;

    var matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    var frustum = new THREE.Frustum().setFromMatrix(matrix);

    // TODO: using AABB to Culling
    return frustum.intersectsObject(tile._entity);
}

function visitIfVisible (primative, tile) {
    if (computeTileVisibility(primative, tile)) {
        visitTile(primative, tile);
    } else {
        ++primative._debug.tilesCulled;
        primative._tileReplacementQueue.markTileRendered(tile);

        // We've decided this tile is not visible, but if it's not fully loaded yet, we've made
        // this determination based on possibly-incorrect information.  We need to load this
        // culled tile with low priority just in case it turns out to be visible after all.
        if (tile.needsLoading) {
            primative._tileLoadQueueLow.push(tile);
        }
    }
}

function addTileToRenderList (primative, tile) {
    primative._activeTiles.push(tile);

    ++primative._debug.tilesRendered;
}

function processTileLoadQueue (primative) {
    var tileLoadQueueHigh = primative._tileLoadQueueHigh;
    var tileLoadQueueMedium = primative._tileLoadQueueMedium;
    var tileLoadQueueLow = primative._tileLoadQueueLow;

    // if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
    //     return;
    // }

    // Remove any tiles that were not used this frame beyond the number
    // we're allowed to keep.
    primative._tileReplacementQueue.trimTiles(primative.tileCacheSize);

    var endTime = Date.now() + primative._loadQueueTimeSlice;

    processSinglePriorityLoadQueue(primative, endTime, tileLoadQueueHigh);
    processSinglePriorityLoadQueue(primative, endTime, tileLoadQueueMedium);
    processSinglePriorityLoadQueue(primative, endTime, tileLoadQueueLow);
}

function processSinglePriorityLoadQueue (primative, endTime, loadQueue) {
    for (var i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
        var tile = loadQueue[i];
        primative._tileReplacementQueue.markTileRendered(tile);

        // TODO: LoadTile
        // primative._imagery.loadTile(tile);
    }
}

function updateTileLoadProgress (primative) {
    var currentLoadQueueLength = primative._tileLoadQueueHigh.length + primative._tileLoadQueueMedium.length + primative._tileLoadQueueLow.length;

    if (currentLoadQueueLength !== primative._lastTileLoadQueueLength) {
        primative._lastTileLoadQueueLength = currentLoadQueueLength;
    }

    var debug = primative._debug;
    if (debug.enableDebugOutput && !debug.suspendLodUpdate) {
        if (debug.tilesVisited !== debug.lastTilesVisited ||
            debug.tilesRendered !== debug.lastTilesRendered ||
            debug.tilesCulled !== debug.lastTilesCulled ||
            debug.maxDepth !== debug.lastMaxDepth ||
            debug.tilesWaitingForChildren !== debug.lastTilesWaitingForChildren) {
            console.log('Visited ' + debug.tilesVisited + ', Rendered: ' + debug.tilesRendered + ', Culled: ' + debug.tilesCulled + ', Max Depth: ' + debug.maxDepth + ', Waiting for children: ' + debug.tilesWaitingForChildren);

            debug.lastTilesVisited = debug.tilesVisited;
            debug.lastTilesRendered = debug.tilesRendered;
            debug.lastTilesCulled = debug.tilesCulled;
            debug.lastMaxDepth = debug.maxDepth;
            debug.lastTilesWaitingForChildren = debug.tilesWaitingForChildren;
        }
    }
}

module.exports = QuadTree;