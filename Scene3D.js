Qt.include("/Core/TextureGenerator.js");

/**
 * Scene3D Class
 * @alias Scene3D
 * @constructor
 */
function Scene3D() {
    /**
     * @type TextureGenerator
     */
    this._textureGenerator = null;
    /**
     * @type QuadTree
     */
    this._quadTree = null;
}

/**
 * @param {QuadTree} quadTree 
 * @param {Tile} tile 
 * @returns {number} screenSpaceError of tile
 */
Scene3D.prototype.screenSpaceError = function(quadTree, tile) {
    var maxGeometricError = quadTree.getLevelMaximumGeometricError(tile.z);

    var distance = tile.bbox.distanceFromPoint(quadTree.cameraController.object.position);
    var height = Math.max(quadTree.cameraController.canvas.height, quadTree.cameraController.canvas.width);
    var sseDenominator = 2 * Math.tan(quadTree.cameraController.object.fov * Math.PI / (2 * 180));

    var error = (maxGeometricError * height) / (distance * sseDenominator);

    // TODO: Fof from Cesium
    // if (frameState.fog.enabled) {
    // 	error = error - CesiumMath.fog(distance, frameState.fog.density) * frameState.fog.sse;
    // }

    return error;
}

Object.defineProperties(Scene3D.prototype, {
    /**
     * Gets the quad tree.
     * @memberof Scene3D.prototype
     * @type {QuadTree}
     */
    quadTree: {
        get: function() {
            return this._quadTree;
        },
        set: function(value) {
            this._quadTree = value;
            this._textureGenerator = new TextureGenerator({ quadTree: value });
        }
    }
});
