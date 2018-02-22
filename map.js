Qt.include("/Core/MapSettings.js")
Qt.include("/Core/Tile.js")
Qt.include("/Core/TilingScheme.js")
Qt.include("/Core/TileReplacementQueue.js");
Qt.include("/Core/AABB.js");
//Qt.include("/Core/Imagery.js");
//Qt.include("/Core/DebugImagery.js");
Qt.include("/Core/TextureGenerator.js");
Qt.include("/Utility/SphericalMercator.js");
Qt.include("/Object/Mission.js");
Qt.include("/Object/Polygon.js");

var SceneMode = {
	SCENE2D: 0,
	SCENE3D: 1
};

var sphericalMercator = new SphericalMercator({ size: MapSettings.basePlaneDimension });

function Map(options) {
    if (!options) throw new Error('No option provided');
    if (typeof options.cameraController === 'undefined') throw new Error('No option.cameraController provided');
    this.cameraController = options.cameraController;
    // if (typeof options.tileReplacementQueue === 'undefined') throw new Error('No option.tileReplacementQueue provided');
    // this._tileReplacementQueue = options.tileReplacementQueue;
    if (typeof options.scene === 'undefined') throw new Error('No options.scene provided');
    this.scene = options.scene;

    this._tilingScheme = new TilingScheme();
    this._rootTile = Tile.createRootTile(this.scene, this._tilingScheme);

    this._activeTiles = [];
    this._tileLoadQueueHigh = []; // high priority tiles are preventing refinement
    this._tileLoadQueueMedium = []; // medium priority tiles are being rendered
    this._tileLoadQueueLow = []; // low priority tiles were refined past or are non-visible parts of quads.

    this._tileReplacementQueue = new TileReplacementQueue();

    // Image downloader
    // this._imagery = new Imagery({});
    this._textureGenerator = new TextureGenerator({ map: this });
    
    this._levelZeroTiles = undefined;
    this._loadQueueTimeSlice = 5.0;

    this._addHeightCallbacks = [];
    this._removeHeightCallbacks = [];

    this._tileToUpdateHeights = [];
    this._lastTileIndex = 0;
    this._updateHeightsTimeSlice = 2.0;

    this.maximumScreenSpaceError = options.maximumScreenSpaceError || 2;

    this.tileCacheSize = options.tileCacheSize || 128;

    this._lastTileLoadQueueLength = 0;

    this.mode = SceneMode.SCENE3D;

    this._levelZeroMaximumGeometricError = this._tilingScheme.ellipsoid * 2 * Math.PI / (MapSettings.basePlaneDimension * 1);

    this._debug = {
      enableDebugOutput : true,

      maxDepth : 0,
      tilesVisited : 0,
      tilesCulled : 0,
      tilesRendered : 0,
      tilesWaitingForChildren : 0,

      lastMaxDepth : -1,
      lastTilesVisited : -1,
      lastTilesCulled : -1,
      lastTilesRendered : -1,
      lastTilesWaitingForChildren : -1,

      suspendLodUpdate : false
    };

    // Mission
    this.missions = [];
    this._currentMission = undefined;

    // View
}

Object.defineProperties(Map.prototype, {
    currentMission: {
        get: function() {
            if (!this._currentMission) {
                this._currentMission = new Polygon({ map: this });
                this.missions.push(this._currentMission);
            }
            return this._currentMission;
        }
    }
});

Map.prototype.suspendLodUpdate = function(value) {
    this._debug.suspendLodUpdate = value;
}

Map.prototype.update = function() {
    clearTileLoadQueue(this);
    this._tileReplacementQueue.markStartOfRenderFrame();

    // console.log('Before rendering', this._activeTiles.length)
   this._activeTiles.forEach(function(tile) {
       tile.active = false;
   });
   this.scene.children.forEach(function(child) {
       if (!child.tile) return;
       child.tile.active = false;
   })

    selectTilesForRendering(this);

    this._activeTiles.forEach(function(tile) {
        tile.active = true;
    });
    // console.log('After rendering', this._activeTiles.length)

    processTileLoadQueue(this);
    updateTileLoadProgress(this);

    this._textureGenerator.load();
}

function clearTileLoadQueue(map) {
    var debug = map._debug;
    debug.maxDepth = 0;
    debug.tilesVisited = 0;
    debug.tilesCulled = 0;
    debug.tilesRendered = 0;
    debug.tilesWaitingForChildren = 0;

    map._tileLoadQueueHigh.length = 0;
    map._tileLoadQueueMedium.length = 0;
    map._tileLoadQueueLow.length = 0;
}


Map.prototype.getLevelMaximumGeometricError = function(level) {
    return this._levelZeroMaximumGeometricError / (1 << level);
}

function selectTilesForRendering(map) {
    var debug = map._debug;
    if (debug.suspendLodUpdate) {
        return;
    }

    // Clear the render list.
    var tilesToRender = map._activeTiles;
    tilesToRender.length = 0;

    // We can't render anything before the level zero tiles exist.
    var tileProvider = map._tileProvider;

    var tile;
    var rootTiles = map._rootTile;

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
        map._tileReplacementQueue.markTileRendered(tile);
        if (!tile.renderable) {
            if (tile.needsLoading) {
                map._tileLoadQueueHigh.push(tile);
            }
            ++debug.tilesWaitingForChildren;
        } else if (computeTileVisibility(map, tile)) {
            visitTile(map, tile);
        } else {
            if (tile.needsLoading) {
                map._tileLoadQueueLow.push(tile);
            }
            ++debug.tilesCulled;
        }
    }
}

function visitTile(map, tile) {
    var debug = map._debug;

    ++debug.tilesVisited;

    map._tileReplacementQueue.markTileRendered(tile);

    if (tile.z > debug.maxDepth) {
        debug.maxDepth = tile.z;
    }

    // console.log(tile.stringify, screenSpaceError(map, tile));
    if (screenSpaceError(map, tile) < map.maximumScreenSpaceError) {
        // This tile meets SSE requirements, so render it.
        if (tile.needsLoading) {
            // Rendered tile meeting SSE loads with medium priority.
            map._tileLoadQueueMedium.push(tile);
        }
        addTileToRenderList(map, tile);
        return;
    }
    var allAreRenderable = tile.children[0].renderable && tile.children[1].renderable && tile.children[2].renderable && tile.children[3].renderable;
    var allAreUpsampled = tile.children[0].upsampledFromParent && tile.children[1].upsampledFromParent
    && tile.children[2].upsampledFromParent && tile.children[3].upsampledFromParent;
    // console.log(tile.stringify, allAreRenderable, allAreUpsampled)
    if (allAreRenderable) {
        if (allAreUpsampled) {
            // No point in rendering the children because they're all upsampled.  Render this tile instead.
            addTileToRenderList(map, tile);

            // Load the children even though we're (currently) not going to render them.
            // A tile that is "upsampled only" right now might change its tune once it does more loading.
            // A tile that is upsampled now and forever should also be done loading, so no harm done.
            queueChildLoadNearToFar(map, map.cameraController.target.position, tile.children);

            if (tile.needsLoading) {
                // Rendered tile that's not waiting on children loads with medium priority.
                map._tileLoadQueueMedium.push(tile);
            }
        } else {
            // SSE is not good enough and children are loaded, so refine.
            // No need to add the children to the load queue because they'll be added (if necessary) when they're visited.
            visitVisibleChildrenNearToFar(map, tile.children);

            if (tile.needsLoading) {
                // Tile is not rendered, so load it with low priority.
                map._tileLoadQueueLow.push(tile);
            }
        }
    } else {
        // We'd like to refine but can't because not all of our children are renderable.  Load the refinement blockers with high priority and
        // render this tile in the meantime.
        queueChildLoadNearToFar(map, map.cameraController.target, tile.children);
        addTileToRenderList(map, tile);

        if (tile.needsLoading) {
            // We will refine this tile when it's possible, so load this tile only with low priority.
            map._tileLoadQueueLow.push(tile);
        }
    }
}

function queueChildLoadNearToFar(map, cameraPosition, children) {
    children.sort(function(child) {
        return child.bbox.distanceFromPoint(cameraPosition);
    }).forEach(function(child) {
        queueChildTileLoad(map, child);
    });
}

function queueChildTileLoad(map, childTile) {
    map._tileReplacementQueue.markTileRendered(childTile);
    if (childTile.needsLoading) {
        if (childTile.renderable) {
            map._tileLoadQueueLow.push(childTile);
        } else {
            // A tile blocking refine loads with high priority
            map._tileLoadQueueHigh.push(childTile);
        }
    }
}

function visitVisibleChildrenNearToFar(map, children) {
    var cameraPosition = map.cameraController.target;

    // TODO: is .forEach is order
    var sortedChild = children.sort(function(child) {
        return child.bbox.distanceFromPoint(cameraPosition);
    });

    for (var i = 0; i < sortedChild.length; ++i) {
        visitIfVisible(map, sortedChild[i]);
    };
}

function computeTileVisibility(map, tile, debug) {
    var xmin, ymin, zmin, xmax, ymax, zmax;

    var bbox = tile.bbox;
    var camera = map.cameraController.object;

    var matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    var frustum = new THREE.Frustum().setFromMatrix(matrix);

    // console.log(JSON.stringify(bbox))
    // console.log(matrix.elements[0], matrix.elements[1], matrix.elements[2], matrix.elements[3], matrix.elements[4],
    //     matrix.elements[5], matrix.elements[6], matrix.elements[7], matrix.elements[8], matrix.elements[9],
    //     matrix.elements[0], matrix.elements[10], matrix.elements[11], matrix.elements[12]);
    // console.log('--');

    return frustum.intersectsObject(tile._entity);

//    frustum.setFromMatrix(matrix);

//    var intersects = false;
//    for (var i = 0; i < 8; ++i) {
//        var p = new THREE.Vector3(((i >> 0) & 1) ? bbox.xMin : bbox.xMax,
//                ((i >> 1) & 1) ? bbox.yMin : bbox.yMax,
//                ((i >> 2) & 1) ? bbox.zMin : bbox.zMax);
//        console.log('contains', i, frustum.containsPoint(p), JSON.stringify(p.project(camera)));
//        intersects = intersects || frustum.containsPoint(p);
//    }
//    return intersects;
}

function visitIfVisible(map, tile) {
    if (computeTileVisibility(map, tile)) {
        visitTile(map, tile);
    } else {
    	++map._debug.tilesCulled;
    	map._tileReplacementQueue.markTileRendered(tile);

    	// We've decided this tile is not visible, but if it's not fully loaded yet, we've made
    	// this determination based on possibly-incorrect information.  We need to load this
    	// culled tile with low priority just in case it turns out to be visible after all.
    	if (tile.needsLoading) {
    		map._tileLoadQueueLow.push(tile);
    	}
    }
}

function screenSpaceError(map, tile) {
    if (map.mode === SceneMode.SCENE2D || map.cameraController.camera instanceof THREE.OrthographicCamera) {
        return screenSpaceError2D(map, tile);
    }

    var maxGeometricError = map.getLevelMaximumGeometricError(tile.z);

    // TODO: calculate distance from bounding box
    var distance = tile.center.distanceTo(map.cameraController.object.position);
    var height = Math.max(map.cameraController.canvas.height, map.cameraController.canvas.width);
    var sseDenominator = 2 * Math.tan( map.cameraController.object.fov * Math.PI / (2 * 180) );

    var error = (maxGeometricError * height) / (distance * sseDenominator);

    // if (frameState.fog.enabled) {
    // 	error = error - CesiumMath.fog(distance, frameState.fog.density) * frameState.fog.sse;
    // }

    return error;
}

function screenSpaceError2D(map, tile) {
    var camera = map.cameraController.object;

    // Frustum calculate
    var _fovy = (camera.aspect <= 1) ? camera.fov : Math.atan(Math.tan(camera.fov * 0.5) / camera.aspect) * 2.0;
    var top = camera.near * Math.tan(0.5 * _fovy)
    var bottom = -top;
    var right = camera.aspect * top;
    var left = -right;

    var context = map.cameraController.canvas;
    var width = context.width;
    var height = context.height;

    var maxGeometricError = map.getLevelMaximumGeometricError(tile.level);
    var pixelSize = Math.max(top - bottom, right - left) / Math.max(width, height);
    var error = maxGeometricError / pixelSize;

    // if (frameState.fog.enabled && frameState.mode !== SceneMode.SCENE2D) {
    // 	error = error - CesiumMath.fog(tile._distance, frameState.fog.density) * frameState.fog.sse;
    // }

    return error;
}

function addTileToRenderList(map, tile) {
    map._activeTiles.push(tile);

    ++map._debug.tilesRendered;
}

function processTileLoadQueue(map) {
    var tileLoadQueueHigh = map._tileLoadQueueHigh;
    var tileLoadQueueMedium = map._tileLoadQueueMedium;
    var tileLoadQueueLow = map._tileLoadQueueLow;

    if (tileLoadQueueHigh.length === 0 && tileLoadQueueMedium.length === 0 && tileLoadQueueLow.length === 0) {
        return;
    }

    // Remove any tiles that were not used this frame beyond the number
    // we're allowed to keep.
//    map._tileReplacementQueue.trimTiles(map.tileCacheSize);

    var endTime = Date.now() + map._loadQueueTimeSlice;

    processSinglePriorityLoadQueue(map, endTime, tileLoadQueueHigh);
    processSinglePriorityLoadQueue(map, endTime, tileLoadQueueMedium);
    processSinglePriorityLoadQueue(map, endTime, tileLoadQueueLow);
}

function processSinglePriorityLoadQueue(map, endTime, loadQueue) {
    for (var i = 0, len = loadQueue.length; i < len && Date.now() < endTime; ++i) {
        var tile = loadQueue[i];
        map._tileReplacementQueue.markTileRendered(tile);

        // TODO: LoadTile
        // map._imagery.loadTile(tile);
    }
}

function updateTileLoadProgress(map) {
    var currentLoadQueueLength = map._tileLoadQueueHigh.length + map._tileLoadQueueMedium.length + map._tileLoadQueueLow.length;

    if (currentLoadQueueLength !== map._lastTileLoadQueueLength) {
        map._lastTileLoadQueueLength = currentLoadQueueLength;
    }

    var debug = map._debug;
    if (debug.enableDebugOutput  && !debug.suspendLodUpdate) {
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

Map.prototype.addPin = function(position) {
    if (typeof this._currentMission === 'undefined') {
        this._currentMission = new Polygon({ map: map });
        this.missions.push(this._currentMission);
    }

    return this._currentMission.addPin(position);
}

Map.prototype.setView = function(position, zoom) {
    var px = sphericalMercator.px(position, 0);
    px = { x: px.x - MapSettings.basePlaneDimension / 2, y: 0, z: px.y - MapSettings.basePlaneDimension / 2};
    this.cameraController.target.copy(px);

    var distance = Math.pow(0.5, (zoom-4)) * MapSettings.cameraDistance;

    var c = new THREE.Vector3();
    var bearing = this.cameraController.getAzimuthalAngle();
    var pitch = this.cameraController.getPolarAngle();
    c.x = px.x - Math.sin(bearing)*Math.sin(pitch)*distance;
    c.z = px.z + Math.cos(bearing)*Math.sin(pitch)*distance;
    c.y = Math.cos(pitch) * distance;

    var camera = this.cameraController.object;

    camera.position.copy(c);

    camera.lookAt(this.cameraController.target);
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(this.cameraController.object.matrixWorld);
}
