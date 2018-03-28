var TextureGenerator = require('../Core/TextureGenerator');
var TilingScheme = require('../Core/TilingScheme');
var Tile = require('../Core/Tile');

/**
 * Scene3D Class
 * @alias Scene3D
 * @constructor
 * @extends {SceneMode}
 */
function Scene3D () {
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
     * @type QuadTree
     * @private
     */
    this._quadTree = null;

    this._levelZeroMaximumGeometricError = getEstimatedLevelZeroGeometricErrorForAHeightmap(
        this._tilingScheme.ellipsoid,
        64,
        this._tilingScheme.getNumberOfXTilesAtLevel(0)
    );
}

/**
 * @param {Ellipsoid} ellipsoid
 * @param {number} tileImageWidth
 * @param {number} numberOfTilesAtLevelZero
 */
function getEstimatedLevelZeroGeometricErrorForAHeightmap (ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
    return ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (tileImageWidth * numberOfTilesAtLevelZero);
};

Scene3D.prototype.getLevelMaximumGeometricError = function (level) {
    return this._levelZeroMaximumGeometricError / (1 << level);
};

/**
 * Screen space error calculation
 * @param {QuadTree} quadTree
 * @param {Tile} tile
 * @returns {number} screenSpaceError of tile
 */
Scene3D.prototype.screenSpaceError = function (quadTree, tile) {
    var camera = quadTree.cameraController.object;
    var maxGeometricError = this.getLevelMaximumGeometricError(tile.z);

    // Update distance of tile from camera
    if (camera.updatedLastFrame) {
        tile.distance = tile.bbox.distanceToCamera(quadTree.cameraController.object);
    }

    var height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
    var sseDenominator = 2 * Math.tan(quadTree.cameraController.object.fov * Math.PI / (2 * 180));

    var error = (maxGeometricError * height) / (tile.distance * sseDenominator);

    // TODO: Fof from Cesium
    // if (frameState.fog.enabled) {
    //  error = error - CesiumMath.fog(distance, frameState.fog.density) * frameState.fog.sse;
    // }

    return error;
};

Object.defineProperties(Scene3D.prototype, {
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
            this._quadTree._rootTile = Tile.createRootTile(this._quadTree, this._tilingScheme);
            this._textureGenerator = new TextureGenerator({ quadTree: value });
        }
    }
});

module.exports = Scene3D;
