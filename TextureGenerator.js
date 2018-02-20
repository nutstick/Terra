Qt.include("three.js")

function TextureGenerator(options) {
    if (!options) throw new Error('No options provided');

    if (!options.map) throw new Error('No options.map provided');
    this._map = options.map;
    this._maxLoad = options.maxLoad || 50;

    this._loading = 0;
    this._loadingThisTick = 0;
}

TextureGenerator.prototype.url = function(x, y, z) {
    var serverIndex = 2*(x%2)+y%2
    var server = ['a','b','c','d'][serverIndex]
    return 'https://'+server+'.tiles.mapbox.com/v4/mapbox.satellite/'+z+'/'+x+'/'+y
        +'@2x.png?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
}

TextureGenerator.prototype.loadTile = function(tile) {
    if (this._loadingThisTick <= 0) return;
    if (!tile.needsLoading) return;

    var scope = this;
    this._loadingThisTick--;
    this._loading++;

    var texture = new THREE.TextureLoader()
        .load(
            this.url(tile._x, tile._y, tile._z),
            function(resp) {
                tile.imageryDone('texture');
                scope._loading--;
            },
            function() {},
            function(err) {
                tile.imageryFailed('texture');
                scope._loading--;
                console.error('Error loading texture' + tile.stringify);
            }
        );

    tile.imageryLoading('texture', texture);
}

TextureGenerator.prototype.load = function() {
    this._loadingThisTick = this._maxLoad - this._loading;
    for (var i = 0; i < map._tileLoadQueueHigh.length && this._loadingThisTick; ++i) {
        this.loadTile(map._tileLoadQueueHigh[i]);
    }
    for (var i = 0; i < map._tileLoadQueueMedium.length && this._loadingThisTick; ++i) {
        this.loadTile(map._tileLoadQueueHigh[i]);
    }
    for (var i = 0; i < map._tileLoadQueueLow.length && this._loadingThisTick; ++i) {
        this.loadTile(map._tileLoadQueueHigh[i]);
    }
}
