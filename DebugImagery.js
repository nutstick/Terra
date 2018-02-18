Qt.include("three.js")

function DebugImagery(options) {
    if (!options) throw new Error('No option provided');

    if (typeof options.tileReplacementQueue === 'undefined') throw new Error('No option.tileReplacementQueue provided');
    this._tileReplacementQueue = options.tileReplacementQueue;

    this._maxLoad = options._maxLoad || 1;
    this._loadingTile = undefined;
    this._loading = false;
}

DebugImagery.prototype.url = function(x, y, z) {
  throw new Error('No url on DebugImagery');
}

DebugImagery.prototype.start = function() {
  var imagery = this;
  timer.setInterval(function() {
    if (imagery._loading || !imagery._tileReplacementQueue.head) return;
    imagery._loadingTile = imagery._tileReplacementQueue.head;
    imagery._loading = true;

    while(imagery._loadingTile._replacementNext) {
      if (imagery._loadingTile.needsLoading) break;
      imagery._loadingTile = tile._replacementNext;
    }

    if (!imagery._loadingTile.needsLoading) return;

    // console.log('p')
    // var canvas = document.createElement("canvas");
    // console.log('p2', canvas)
    // var canvas2d = canvas.getContext("2d");
    // console.log('p3')
    // canvas.width = canvas.height = 256;
    // console.log('p4')
    // canvas2d.shadowColor = "#000";
    // console.log('5')
    // canvas2d.shadowBlur = 7;
    // console.log('p6')
    // canvas2d.fillStyle = "orange";
    // console.log('p7')
    // canvas2d.font = "30pt arial bold";
    // console.log('p8')
    // canvas2d.fillText('Test', 10, 128);

    // console.log(canvas);

    // var texture = new THREE.Texture(canvas);

    console.log(texture);
    imagery._loadingTile.imageryLoading('texture', texture);

    imagery._loadingTile.imageryDone('texture');
    imagery._loading = false;
  }, 10);
}


