Qt.include("three.js")

function Imagery(options) {
    if (!options) throw new Error('No option provided');

    this._maxLoad = options._maxLoad || 1;
    this._loading = false;
}

Imagery.prototype.url = function(x, y, z) {
    var serverIndex = 2*(x%2)+y%2
    var server = ['a','b','c','d'][serverIndex]
    return 'https://'+server+'.tiles.mapbox.com/v4/mapbox.streets-satellite/'+z+'/'+x+'/'+y
        +'@2x.png?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';
}

Imagery.prototype.loadTile = function(tile) {
    // TODO: maxload
    if (this._loading) return;
    if (!tile.needsLoading) return;

    var scope = this;
    this._loading = true;

    var texture = new THREE.TextureLoader()
        .load(
            this.url(tile._x, tile._y, tile._z),
            function(resp) {
                tile.imageryDone('texture');
                scope._loading = false;
            },
            function() {},
            function(err) {
                tile.imageryFailed('texture');
                scope._loading = false;
                console.error('Error loading texture' + tile.stringify);
            }
        );

    tile.imageryLoading('texture', texture);
}

// Imagery.prototype.start = function() {
//   var imagery = this;
//   timer.setInterval(function() {
//     if (imagery._loading || !imagery._tileReplacementQueue.head) return;
//     imagery._loadingTile = imagery._tileReplacementQueue.head;
//     imagery._loading = true;

//     while(imagery._loadingTile._replacementNext) {
//       if (imagery._loadingTile.needsLoading) break;
//       imagery._loadingTile = tile._replacementNext;
//     }

//     if (!imagery._loadingTile.needsLoading) return;

//     var texture = new THREE.TextureLoader()
//       .load(
//           imagery.url(imagery._loadingTile._x, imagery._loadingTile._y, imagery._loadingTile._z),
//           function(resp) {
//             imagery._loadingTile.imageryDone('texture');
//             imagery._loading = false;
//           },
//           function() {},
//           function(err) {
//             imagery._loadingTile.imageryFailed('texture');
//             imagery._loading = false;
//             console.error('Error loading texture' + tile.stringify);
//           }
//       );

//     imagery._loadingTile.imageryLoading('texture', texture);
//   }, 10);
// }


