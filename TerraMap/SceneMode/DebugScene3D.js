var Scene3D = require('./Scene3D');
var DebugTile = require('../Core/DebugTile');

function DebugScene3D () {
    Scene3D.call(this);
}

DebugScene3D.prototype = Object.create(Scene3D.prototype);

Object.defineProperties(DebugScene3D.prototype, {
    /**
     * Gets the quad tree.
     * @memberof DebugScene3D.prototype
     *
     * @type {QuadTree}
     */
    quadTree: {
        get: function () {
            return this._quadTree;
        },
        set: function (value) {
            this._quadTree = value;
            this._quadTree._rootTile = DebugTile.createRootTile(this._quadTree, this._tilingScheme);
        }
    }
});

module.exports = DebugScene3D;
