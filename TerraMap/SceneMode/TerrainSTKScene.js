var BingMapImageryGenerator = require('../Services/BingMapImageryGenerator');
var TerrainSTKGenerator = require('../Services/TerrainSTKGenerator');
var TilingScheme = require('../Core/TilingScheme');
var TerrainSTKTile = require('../Core/TerrainSTKTile');

/**
 * TerrainSTKScene Class
 * @alias TerrainSTKScene
 * @constructor
 * @extends {SceneMode}
 */
function TerrainSTKScene () {
    /**
     * TilingScheme
     * @type {TilingScheme}
     * @private
     */
    this._tilingScheme = new TilingScheme();
    /**
     * @type TextureGenerator
     * @private
     */
    this._textureGenerator = null;
    /**
     * @type TerrainGenerator
     * @private
     */
    this._terrainGenerator = null;
    /**
     * @type QuadTree
     * @private
     */
    this._quadTree = null;

    this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
        this._tilingScheme.ellipsoid,
        45,
        this._tilingScheme.getNumberOfXTilesAtLevel(0)
    );

    this._instance = TerrainSTKTile;
}

/**
 * @param {Ellipsoid} ellipsoid
 * @param {number} tileImageWidth
 * @param {number} numberOfTilesAtLevelZero
 */
function getEstimatedLevelZeroGeometricErrorForAHeightmap (ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
};

TerrainSTKScene.prototype.getLevelMaximumGeometricError = function (level) {
    return this._levelZeroMaximumGeometricError / (1 << level);
};

/**
 * Screen space error calculation
 * @param {QuadTree} quadTree
 * @param {Tile} tile
 * @returns {number} screenSpaceError of tile
 */
TerrainSTKScene.prototype.screenSpaceError = function (quadTree, tile) {
    var camera = quadTree.camera;
    var maxGeometricError = this.getLevelMaximumGeometricError(tile.z);

    // Update distance of tile from camera
    if (camera.updatedLastFrame || !tile.distance) {
        tile.distance = tile.bbox.distanceToCamera(quadTree.camera);
    }

    var height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
    var sseDenominator = 2 * Math.tan(camera.fov * Math.PI / (2 * 180));

    var error = (maxGeometricError * height) / (tile.distance * sseDenominator)

    // TODO: Fof from Cesium
    // if (frameState.fog.enabled) {
    //  error = error - CesiumMath.fog(distance, frameState.fog.density) * frameState.fog.sse;
    // }

    return error;
};

Object.defineProperties(TerrainSTKScene.prototype, {
    /**
     * Gets the quad tree.
     * @memberof Scene3D.prototype
     *
     * @type {QuadTree}
     */
    quadTree: {
        get: function () {
            return this._quadTree;
        },
        set: function (value) {
            this._quadTree = value;
            this._textureGenerator = new BingMapImageryGenerator({ quadTree: value });
            this._terrainStkGenerator = new TerrainSTKGenerator({ quadTree: value });
        }
    }
});

module.exports = TerrainSTKScene;
