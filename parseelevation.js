
/*
 * SphericalMercator
 */
var SphericalMercator = (function(){
var cache = {},
    EPSLN = 1.0e-10,
    D2R = Math.PI / 180,
    R2D = 180 / Math.PI,
    // 900913 properties.
    A = 6378137.0,
    MAXEXTENT = 20037508.342789244;

function SphericalMercator(options) {
    options = options || {};
    this.size = options.size || 256;
    if (!cache[this.size]) {
        var size = this.size;
        var c = cache[this.size] = {};
        c.Bc = [];
        c.Cc = [];
        c.zc = [];
        c.Ac = [];
        for (var d = 0; d < 30; d++) {
            c.Bc.push(size / 360);
            c.Cc.push(size / (2 * Math.PI));
            c.zc.push(size / 2);
            c.Ac.push(size);
            size *= 2;
        }
    }
    this.Bc = cache[this.size].Bc;
    this.Cc = cache[this.size].Cc;
    this.zc = cache[this.size].zc;
    this.Ac = cache[this.size].Ac;
};
SphericalMercator.prototype.px = function(ll, zoom) {
    var d = this.zc[zoom];
    var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
    var x = (d + ll[0] * this.Bc[zoom]);
    var y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]));
    if (x > this.Ac[zoom]) x = this.Ac[zoom];
    if (y > this.Ac[zoom]) y = this.Ac[zoom];
    //(x < 0) && (x = 0);
    //(y < 0) && (y = 0);
    return [x, y];
};
SphericalMercator.prototype.ll = function(px, zoom) {
    var g = (px[1] - this.zc[zoom]) / (-this.Cc[zoom]);
    var lon = (px[0] - this.zc[zoom]) / this.Bc[zoom];
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
};
SphericalMercator.prototype.bbox = function(x, y, zoom, tms_style, srs) {
    // Convert xyz into bbox with srs WGS84
    if (tms_style) {
        y = (Math.pow(2, zoom) - 1) - y;
    }
    // Use +y to make sure it's a number to avoid inadvertent concatenation.
    var ll = [x * this.size, (+y + 1) * this.size]; // lower left
    // Use +x to make sure it's a number to avoid inadvertent concatenation.
    var ur = [(+x + 1) * this.size, y * this.size]; // upper right
    var bbox = this.ll(ll, zoom).concat(this.ll(ur, zoom));

    // If web mercator requested reproject to 900913.
    if (srs === '900913') {
        return this.convert(bbox, '900913');
    } else {
        return bbox;
    }
};
SphericalMercator.prototype.xyz = function(bbox, zoom, tms_style, srs) {
    // If web mercator provided reproject to WGS84.
    if (srs === '900913') {
        bbox = this.convert(bbox, 'WGS84');
    }

    var ll = [bbox[0], bbox[1]]; // lower left
    var ur = [bbox[2], bbox[3]]; // upper right
    var px_ll = this.px(ll, zoom);
    var px_ur = this.px(ur, zoom);
    // Y = 0 for XYZ is the top hence minY uses px_ur[1].
    var x = [ Math.floor(px_ll[0] / this.size), Math.floor((px_ur[0] - 1) / this.size) ];
    var y = [ Math.floor(px_ur[1] / this.size), Math.floor((px_ll[1] - 1) / this.size) ];
    var bounds = {
        minX: Math.min.apply(Math, x) < 0 ? 0 : Math.min.apply(Math, x),
        minY: Math.min.apply(Math, y) < 0 ? 0 : Math.min.apply(Math, y),
        maxX: Math.max.apply(Math, x),
        maxY: Math.max.apply(Math, y)
    };
    if (tms_style) {
        var tms = {
            minY: (Math.pow(2, zoom) - 1) - bounds.maxY,
            maxY: (Math.pow(2, zoom) - 1) - bounds.minY
        };
        bounds.minY = tms.minY;
        bounds.maxY = tms.maxY;
    }
    return bounds;
};
SphericalMercator.prototype.convert = function(bbox, to) {
    if (to === '900913') {
        return this.forward(bbox.slice(0, 2)).concat(this.forward(bbox.slice(2,4)));
    } else {
        return this.inverse(bbox.slice(0, 2)).concat(this.inverse(bbox.slice(2,4)));
    }
};
SphericalMercator.prototype.forward = function(ll) {
    var xy = [
        A * ll[0] * D2R,
        A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * ll[1] * D2R)))
    ];
    // if xy value is beyond maxextent (e.g. poles), return maxextent.
    if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT;
    if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT;
    if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT;
    if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT;
    return xy;
};
SphericalMercator.prototype.inverse = function(xy) {
    return [
        (xy[0] * R2D / A),
        ((Math.PI*0.5) - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D
    ];
};

return SphericalMercator;

})();


var basePlaneDimension = 65024;
var tilePixels = new SphericalMercator({size: 128});
var working = false;

var cols = 512
var rows = 512
var scaleFactor = 4

var sixteenthPixelRanges = [];

for (var c=0; c<scaleFactor;c++){
    for (var r=0; r<scaleFactor; r++){
        //pixel ranges
        sixteenthPixelRanges
            .push([
                [r*(rows/scaleFactor-1)+r, (r+1)*rows/scaleFactor],
                [c*(cols/scaleFactor-1)+c, (c+1)*cols/scaleFactor]
            ])
    }
};

WorkerScript.onMessage = function(message) {
    var time = Date.now()
    console.time(time+' worker')

    var pixels = message[0];
    var coords = message[1]; //terrain tile coord
    var tiles = message[2];  //requested imagery coords
    var parserIndex = message[3];
    var z = coords[0];
    var x = coords[1];
    var y = coords[2];
    //console.log(time+' started #'+parserIndex)

    var elevations = [];

    if (pixels) {
        //colors => elevations
        for (var e = 0; e<pixels.data.length; e+=4){
            var R = pixels.data[e];
            var G = pixels.data[e+1];
            var B = pixels.data[e+2];
            elevations.push(-10000 + ((R * 256 * 256 + G * 256 + B) * 0.1))
        }
    }
    else elevations = new Array(1048576).fill(0);

    // figure out tile coordinates of the 16 grandchildren of this tile
    var sixteenths = [];
    for (var c=0; c<scaleFactor;c++){
        for (var r=0; r<scaleFactor; r++){
            //tile coordinates
            sixteenths.push(slashify([z+2,x*scaleFactor+c, y*scaleFactor+r]));
        }
    }


    //iterate through sixteenths...

    var tileSize = basePlaneDimension/(Math.pow(2,z+2));
    var vertices = 128;
    var segments = vertices-1;
    var segmentLength = tileSize/segments;

    var imagesDownloaded = 0;

    //check 16 grandchildren of this terrain tile
    sixteenths.forEach(function(d,i){
        //if this grandchild is actually in view, proceed...
        if (tiles.indexOf(d)>-1){
            imagesDownloaded++
            d = deslash(d);
            var pxRange = sixteenthPixelRanges[i];
            var elev = [];

            var xOffset = (d[1]+0.5)*tileSize - basePlaneDimension/2;
            var yOffset = (d[2]+0.5)*tileSize - basePlaneDimension/2;

            //grab its elevations from the 4x4 grid
            for (var r = pxRange[0][0]; r<pxRange[0][1]; r++){
                for (var c = pxRange[1][0]; c<pxRange[1][1]; c++){
                    var currentPixelIndex = r*cols+c;
                    elev.push(elevations[currentPixelIndex])
                }
            }
            var array = [];
            var dataIndex = 0;

            //iterate through rows
            for (var r = 0; r<vertices; r++){

                var yPx = d[2]*128+r;
                var pixelLat = tilePixels.ll([x*tileSize, yPx], d[0])[1]   //latitude of this pixel
                var metersPerPixel = mPerPixel(pixelLat, tileSize, d[0])   //real-world distance this pixel represents

                // y position of vertex in world pixel coordinates
                var yPos = -r * segmentLength + tileSize/2;

                //iterate through columns
                for (var c = 0; c<vertices; c++){
                    var xPos = c * segmentLength - tileSize/2;
                    array.push(xPos+xOffset, elev[dataIndex]/metersPerPixel, -yPos+yOffset)
                    dataIndex++
                }
            }
            WorkScript.sendMessage({ makeMesh: [array, d] });
        }
    })

};


function slashify(input) {
    return input.join('/');
}
function deslash(input){
    return input.split('/').map(function(str){return parseInt(str)});
}
function mPerPixel(latitude, tileSize, zoom) {
    return Math.abs(
        40075000 * Math.cos(latitude*Math.PI/180) / (Math.pow(2,zoom) * tileSize )
    );
}
