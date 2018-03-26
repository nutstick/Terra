/**
 * SceneMode Class
 * @alias SceneMode
 * @constructor
 */
function SceneMode() {
    throw new Error('Implementation error SceneMode is abstract class');
}

/**
 * @param {QuadTree} quadTree 
 * @param {Tile} tile 
 * @returns {number} screenSpaceError of tile
 */
SceneMode.prototype.screenSpaceError = function(quadTree, tile) {
    throw new Error('Implementation error SceneMode is abstract class');
}

Object.defineProperties(SceneMode.prototype, {
    /**
     * Gets the quad tree.
     * @memberof SceneMode.prototype
     * @type {QuadTree}
     */
    quadTree: {
        get: function() {
            throw new Error('Implementation error SceneMode.quadTree is abstract class');
        }
    }
});

module.exports = SceneMode;
