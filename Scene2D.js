Qt.include("/Core/TextureGenerator.js");

/**
 * Scene3D Class
 * @alias Scene3D
 * @constructor
 */
function Scene2D() {
    /**
     * @type TextureGenerator
     */
    this._textureGenerator = null;
    /**
     * @type QuadTree
     */
    this._quadTree = null;
}

// FIXME: Screen space error calculation
Scene2D.prototype.screenSpaceError = function(quadTree, tile) {
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

Object.defineProperties(Scene2D.prototype, {
    /**
     * Gets the quad tree.
     * @memberof Scene2D.prototype
     * @type {QuadTree}
     */
    quadTree: {
        get: function() {
            return this._quadTree;
        },
        set: function(value) {
            this._quadTree = value;
            this._textureGenerator = new TextureGenerator({ quadTree: value})
        }
    }
});
