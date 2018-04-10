/**
 * SceneMode Class
 * @alias SceneMode
 * @constructor
 */
function RenderingObject () {
    throw new Error('Implementation error RenderingObject is abstract class');
}

/**
* @param {QuadTree} quadTree
* @param {Tile} tile
* @returns {number} screenSpaceError of tile
*/
RenderingObject.prototype.updateTarget = function (target) {
    throw new Error('Implementation error RenderingObject is abstract class');
};

Object.defineProperties(RenderingObject.prototype, {
    /**
     * Gets cartographic coordinate.
     * @memberof RenderingObject.prototype
     * @type {QtPositioning.coordinate}
     */
    coordinate: {
        get: function () {
            throw new Error('Implementation error RenderingObject.coordinate is abstract class');
        },
        set: function () {
        throw new Error('Implementation error RenderingObject.coordinate is abstract class');
        }
    },
    /**
     * Gets rendering scale.
     * @memberof RenderingObject.prototype
     * @type {number}
     */
    scale: {
        get: function () {
            throw new Error('Implementation error RenderingObject.scale is abstract class');
        },
        set: function () {
        throw new Error('Implementation error RenderingObject.scale is abstract class');
        }
    }
});

module.exports = RenderingObject;
