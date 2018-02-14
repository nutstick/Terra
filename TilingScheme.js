Qt.include("/Core/DeveloperError.js");
Qt.include("/Core/Ellipsoid.js");

function TilingScheme() {
    this._ellipsoid = 6378137.0;// new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793);
    this._numberOfLevelZeroTilesX = 1;
    this._numberOfLevelZeroTilesY = 1;
}

Object.defineProperties(TilingScheme.prototype, {
    /**
     * Gets the ellipsoid that is tiled by the tiling scheme.
     * @memberof TilingScheme.prototype
     * @type {Ellipsoid}
     */
    ellipsoid: {
        get : function() {
            return this._ellipsoid;
        }
    },
});

TilingScheme.prototype.getNumberOfXTilesAtLevel = function (level) {
    return this._numberOfLevelZeroTilesX << level;
}

TilingScheme.prototype.getNumberOfYTilesAtLevel = function (level) {
    return this._numberOfLevelZeroTilesY << level;
}
