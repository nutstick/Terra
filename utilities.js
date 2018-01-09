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
var mercator = new SphericalMercator({size: basePlaneDimension});
var elevationCache = {};

var demCache = [];

for (var i=0; i<22; i++){
    demCache.push([])
}


function getCenter(){
    var pt = controls.target;
    var lngLat = mercator.ll([pt.x+basePlaneDimension/2, pt.z+basePlaneDimension/2],0);
    return lngLat.map(function(num){return roundTo(num,4)})
}

function mPerPixel(latitude, tileSize, zoom) {
    return Math.abs(
        40075000 * Math.cos(latitude*Math.PI/180) / (Math.pow(2,zoom) * tileSize )
    );
}


function slashify(input){
    return input.join('/');
}

function deslash(input){
    return input.split('/').map(function(str){return parseInt(str)});
}


function getBaseLog(base, result) {
  return Math.log(result) / Math.log(base);
}



//project screen coordinates to scene coordinates

function projectToScene(px){
    var screenPosition = {x: (px[0]/width-0.5)*2, y:(0.5-px[1]/height)*2};
    raycaster.setFromCamera(screenPosition, camera);
    var pt = raycaster.intersectObject(plane)[0].point;
    return pt
}


//scene coordinates to lngLat (as intersecting with plane)
function unproject(pt){
    var lngLat = mercator.ll([pt.x+basePlaneDimension/2, pt.y+basePlaneDimension/2],0);
    return lngLat
}

// lngLat to scene coordinates (as intersecting with plane)
function project(lnglat){
    var px = mercator.px(lnglat,0);
    px = {x:px[0]-basePlaneDimension/2, y:0, z:px[1]-basePlaneDimension/2};
    return px
}



var totalCount = 49152;
var rowCount = 384
//above, left, below, right
var neighborTiles = [[0,0,-1],[0,-1,0],[0,0,1],[0,1,0]];
var row = [[],[],[],[]];

//get specific pixel indices of each edge
for (var c=0; c<rowCount; c+=3) {
    //top, left, bottom, right
    row[0].push(c+1);
    row[1].push(c/3*(rowCount)+1);
    row[2].push(c+1+totalCount-rowCount);
    row[3].push((c/3+1)*(rowCount)-2);
}

//fill seam between elevation tiles by adopting the edge of neighboring tiles
function resolveSeams(data, neighborTiles, coordinates){
    var x = coordinates[1];
    var y = coordinates[2];
    var z = coordinates[0];
    //iterate through neighbors
    neighborTiles.forEach(function(tile, index){

        //figure out neighbor tile coordinate
        var targetTile = tile.map(function(coord,index){
            return coord+[z,x,y][index]
        })

        //if neighbor exists,
        var neighbor = scene.getObjectByProperty('coords',slashify(targetTile));
        if (neighbor){
            // indices that need to be overwritten
            var indicesToChange = row[index];
            //indices of neighbor vertices to copy
            var neighborIndices = row[(index+2)%4];
            var neighborVertices = neighbor.geometry.attributes.position.array;

            for (var a = 0; a<128;a++){
                data[indicesToChange[a]] = neighborVertices[neighborIndices[a]]
            }
        }
    })
    return data
}


function setHash(){

    var lngLat =
    [roundTo(getZoom(),4)]
    .concat(getCenter().reverse());

    lngLat
    .push(-deradicalize(controls.getAzimuthalAngle()),deradicalize(controls.getPolarAngle()))

    hash= slashify(lngLat)
    // var target = [controls.target.x, controls.target.z];
    // var camera = [controls.object.position.x,controls.object.position.z, controls.object.position.y]
    // var hash = target.concat(camera);
    // hash = slashify(hash.map(function(num){return parseFloat(num).toFixed(4)}));
    location.hash = (hash);

    var lngLat = getCenter();
    document.querySelector('#lnglat').innerHTML = lngLat;

    markerx.setLatLng(lngLat.reverse());

}

function setView(controls,location){
    var hash = location
        .replace('#','')
        .split('/').map(
            function(str){
                return parseFloat(str)
            }
        );
    if (hash.length === 5){
        [zoom, lat, lng, bearing, pitch] = hash
        var pxCoords = project([lng,lat]);
        controls.target.copy(pxCoords);

        var distance = Math.pow(0.5,(zoom-4))*12000;
        bearing = radicalize(bearing);
        pitch = radicalize(pitch);
        var c={};
        c.x = pxCoords.x-Math.sin(bearing)*Math.sin(pitch)*distance;
        c.z = pxCoords.z+Math.cos(bearing)*Math.sin(pitch)*distance;

        c.y = Math.cos(pitch)*distance
        controls.object.position.copy(c)
    }
}
function radicalize(degrees){
    return 2*Math.PI*degrees/360
}
function deradicalize(radians){
    return roundTo((360*radians/(2*Math.PI)),4)
}

function roundTo(number, decimals){
    return number.toFixed(decimals)/1
}
// Utility function to replace .bind(this) since it is not available in all browsers.
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

/**
 * Define the DraggableNumber element.
 * @constructor
 * @param {DomElement} input - The input which will be converted to a draggableNumber.
 */
DraggableNumber = function (input, options) {
  this._options = options !== undefined ? options : {};

  this._input = input;
  this._span = document.createElement("span");
  this._isDragging = false;
  this._lastMousePosition = {x: 0, y: 0};
  this._value = 0;
  this._startValue = this._value;
  this._step = 1;

  // Minimum mouse movement before a drag start.
  this._dragThreshold = this._setOption('dragThreshold', 10);

  // Min/max value.
  this._min = this._setOption('min', -Infinity);
  this._max = this._setOption('max', Infinity);

  // Store the original display style for the input and span.
  this._inputDisplayStyle = "";
  this._spanDisplayStyle = "";

  this._init();
};

/**
 * Constant used when there is no key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_NONE = 0;

/**
 * Constant used when there is a shift key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_LARGE = 1;

/**
 * Constant used when there is a control key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_SMALL = 2;

DraggableNumber.prototype = {
  constructor: DraggableNumber,

  /**
   * Initialize the DraggableNumber.
   * @private
   */
  _init: function () {
    // Get the inital _value from the input.
    this._value = parseFloat(this._input.value, 10);

    // Add a span containing the _value. Clicking on the span will show the
    // input. Dragging the span will change the _value.
    this._addSpan();

    // Save the original display style of the input and span.
    this._inputDisplayStyle = this._input.style.display;
    this._spanDisplayStyle = this._span.style.display;

    // Hide the input.
    this._input.style.display = 'none';

    // Bind 'this' on event callbacks.
    this._onMouseUp = __bind(this._onMouseUp, this);
    this._onMouseMove = __bind(this._onMouseMove, this);
    this._onMouseDown = __bind(this._onMouseDown, this);
    this._onInputBlur = __bind(this._onInputBlur, this);
    this._onInputKeyDown = __bind(this._onInputKeyDown, this);
    this._onInputChange = __bind(this._onInputChange, this);

    // Add mousedown event handler.
    this._span.addEventListener('mousedown', this._onMouseDown, false);

    // Add key events on the input.
    this._input.addEventListener('blur', this._onInputBlur, false);
    this._input.addEventListener('keypress', this._onInputKeyDown, false);

    // Directly assign the function instead of using addeventlistener.
    // To programatically change the _value of the draggableNumber you
    // could then do:
    // input._value = new_number;
    // input.onchange();
    this._input.onchange = this._onInputChange;
  },

  /**
   * Set the DraggableNumber value.
   * @public
   * @param {Number} new_value - The new value.
   */
  set: function (new_value) {
    new_value = this._constraintValue(new_value);
    if (this._value !== new_value) {
      this._value = new_value;
      this._input.value = this._value;
      this._span.innerHTML = this._value;
    }
  },

  /**
   * Get the DraggableNumber value.
   * @public
   * @returns {Number}
   */
  get: function () {
    return this._value;
  },

  /**
   * Set the minimum value.
   * @public
   * @param {Number} min - The minimum value.
   */
  setMin: function (min) {
    this._min = min;
    // Set the value with current value to automatically constrain it if needed.
    this.set(this._value);
  },

  /**
   * Set the maximum value.
   * @public
   * @param {Number} min - The minimum value.
   */
  setMax: function (max) {
    this._max = max;
    // Set the value with current value to automatically constrain it if needed.
    this.set(this._value);
  },

  /**
   * Remove the DraggableNumber.
   * @public
   */
  destroy: function () {
    // Remove event listeners.
    this._span.removeEventListener('mousedown', this._onMouseDown, false);
    this._input.removeEventListener('blur', this._onInputBlur, false);
    this._input.removeEventListener('keypress', this._onInputKeyDown, false);
    document.removeEventListener('mouseup', this._onMouseUp, false);
    document.removeEventListener('mousemove', this._onMouseMove, false);

    // Remove the span element.
    if (this._span.parentNode) {
      this._span.parentNode.removeChild(this._span);
    }

    // Delete variables.
    delete this._input;
    delete this._span;
    delete this._inputDisplayStyle;
    delete this._spanDisplayStyle;
  },

  /**
   * Set an option value based on the option parameter and the data attribute.
   * @private
   * @param {String} name - The option name.
   * @param {Number} defaultValue - The default value.
   * @returns {Number}
   */
  _setOption: function (name, defaultValue) {
    // Return the option if it is defined.
    if (this._options[name] !== undefined) {
      return this._options[name];
    }
    // Return the data attribute if it is defined.
    if (this._input.hasAttribute("data-" + name)) {
      return parseFloat(this._input.getAttribute("data-" + name), 10);
    }
    // If there is no option and no attribute, return the default value.
    return defaultValue;
  },

  /**
   * Prevent selection on the whole document.
   * @private
   * @param {Boolean} prevent - Should we prevent or not the selection.
   */
  _preventSelection: function (prevent) {
    var value = 'none';
    if (prevent === false) {
      value = 'all';
    }

    document.body.style['-moz-user-select'] = value;
    document.body.style['-webkit-user-select'] = value;
    document.body.style['-ms-user-select'] = value;
    document.body.style['user-select'] = value;
  },

  /**
   * Add a span element before the input.
   * @private
   */
  _addSpan: function () {
    var inputParent = this._input.parentNode;
    inputParent.insertBefore(this._span, this._input);
    this._span.innerHTML = this.get();

    // Add resize cursor.
    this._span.style.cursor = "col-resize";
    this._span.classList = 'dragger'


  },

  /**
   * Display the input and hide the span element.
   * @private
   */
  _showInput: function () {
    return
    this._startValue = this._value;
    this._input.style.display = this._inputDisplayStyle;
    this._span.style.display = 'none';
    this._input.focus();
  },

  /**
   * Show the span element and hide the input.
   * @private
   */
  _showSpan: function () {
    this._input.style.display = 'none';
    this._span.style.display = this._spanDisplayStyle;
  },

  /**
   * Called on input blur, set the new value and display span.
   * @private
   * @param {Object} e - Event.
   */
  _onInputBlur: function (e) {
    this._onInputChange();
    this._showSpan();
    // Call onchange callback if it exists.
    if ("endCallback" in this._options) {
      if (this._value != this._startValue) {
        this._options.endCallback(this._value);
      }
    }
  },

  /**
   * Called on input onchange event, set the value based on the input value.
   * @private
   */
  _onInputChange: function () {
    this.set(parseFloat(this._input.value, 10));
  },

  /**
   * Called on input key down, blur on enter.
   * @private
   * @param {Object} e - Key event.
   */
  _onInputKeyDown: function (e) {
    var keyEnter = 13;
    if (e.charCode == keyEnter) {
      this._input.blur();
    }
  },

  /**
   * Called on span mouse down, prevent selection and initalize logic for mouse drag.
   * @private
   * @param {Object} e - Mouse event.
   */
  _onMouseDown: function (e) {
    this._preventSelection(true);
    this._isDragging = false;
    this._lastMousePosition = {x: e.clientX, y: e.clientY};
    this._startValue = this._value;
    this._step = this._getStep(this._value);

    document.addEventListener('mouseup', this._onMouseUp, false);
    document.addEventListener('mousemove', this._onMouseMove, false);
  },

  /**
   * Called on span mouse up, show input if no drag.
   * @private
   * @param {Object} e - Mouse event.
   */
  _onMouseUp: function (e) {
    this._preventSelection(false);
    // If we didn't drag the span then we display the input.
    if (this._isDragging === false) {
      this._showInput();
    }
    this._isDragging = false;

    document.removeEventListener('mouseup', this._onMouseUp, false);
    document.removeEventListener('mousemove', this._onMouseMove, false);

    // Call complete callback if it exists.
    if ("endCallback" in this._options) {
      // Don't call end callback if nothing changed.
      if (this._startValue != this._value) {
        this._options.endCallback(this._value);
      }
    }
    this._startValue = this._value;
  },

  /**
   * Check if difference bettween 2 positions is above minimum threshold.
   * @private
   * @param {Object} newMousePosition - the new mouse position.
   * @param {Object} lastMousePosition - the last mouse position.
   * @returns {Boolean}
   */
  _hasMovedEnough: function (newMousePosition, lastMousePosition) {
    if (Math.abs(newMousePosition.x - lastMousePosition.x) >= this._dragThreshold ||
      Math.abs(newMousePosition.y - lastMousePosition.y) >= this._dragThreshold) {
      return true;
    }
    return false;
  },

  _onMouseMove: function (e) {
    // Get the new mouse position.
    var newMousePosition = {x: e.clientX, y: e.clientY};

    if (this._hasMovedEnough(newMousePosition, this._lastMousePosition)) {
      this._isDragging = true;
    }

    // If we are not dragging don't do anything.
    if (this._isDragging === false) {
      return;
    }

    // Get the increment modifier. Small increment * 0.1, large increment * 10.
    var modifier = DraggableNumber.MODIFIER_NONE;
    if (e.shiftKey) {
      modifier = DraggableNumber.MODIFIER_LARGE;
    }
    else if (e.ctrlKey) {
      modifier = DraggableNumber.MODIFIER_SMALL;
    }

    // Calculate the delta with previous mouse position.
    var delta = this._getLargestDelta(newMousePosition, this._lastMousePosition);

    // Get the number offset.
    var offset = this._getNumberOffset(delta, modifier);

    var step = this._step * offset;

    // Update the input number.
    var new_value = this.get() + step;
    // Hack for rounding errors.
    new_value = parseFloat(new_value.toFixed(10));
    this.set(new_value);

    // Call onchange callback if it exists.
    if ("changeCallback" in this._options) {
      this._options.changeCallback(new_value);
    }

    // Save current mouse position.
    this._lastMousePosition = newMousePosition;
  },

  _getStep: function (value) {
    var step = 1;
    // The line below was taken from dat.gui: https://code.google.com/p/dat-gui/source/browse/src/dat/controllers/NumberController.js
    if (value !== 0 && isNaN(value) === false) {
      step = Math.pow(10, Math.floor(Math.log(Math.abs(value))/Math.LN10))/10;
    }
    return step;
  },

  /**
   * Return the number offset based on a delta and a modifier.
   * @private
   * @param {Number} delta - a positive or negative number.
   * @param {Number} modifier - the modifier type.
   * @returns {Number}
   */
  _getNumberOffset: function (delta, modifier) {
    var increment = 0.5;

    if (modifier == DraggableNumber.MODIFIER_SMALL) {
      increment *= 0.1;
    }
    else if (modifier == DraggableNumber.MODIFIER_LARGE) {
      increment *= 10;
    }
    // Negative increment if delta is negative.
    if (delta < 0) {
      increment *= -1;
    }
    return increment;
  },

  /**
   * Return the largest difference between two positions, either x or y.
   * @private
   * @param {Object} newMousePosition - the new mouse position.
   * @param {Object} lastMousePosition - the last mouse position.
   * @returns {Number}
   */
  _getLargestDelta: function (newPosition, oldPosition) {
    var result = 0;
    var delta = {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y,
    };

    if (Math.abs(delta.x) > Math.abs(delta.y)) {
      return delta.x;
    }
    else {
      // Inverse the position.y since mouse move to up should increase the _value.
      return delta.y * -1;
    }
  },

  /**
   * Constrain a value between min and max.
   * @private
   * @param {Number} value - The value to constrain.
   * @returns {Number}
   */
  _constraintValue: function (value) {
    value = Math.min(value, this._max);
    value = Math.max(value, this._min);
    return value;
  }
};
