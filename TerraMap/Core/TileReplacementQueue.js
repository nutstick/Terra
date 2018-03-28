/**
 * TileReplacementQueue class
 * @alias TileReplacementQueue
 * @constructor
 */
function TileReplacementQueue () {
    this.head = undefined;
    this.tail = undefined;
    this.count = 0;
    this._lastBeforeStartOfFrame = undefined;
}

/**
 * Marks the start of the render frame.  Tiles before (closer to the head) this tile in the
 * list were used last frame and must not be unloaded.
 */
TileReplacementQueue.prototype.markStartOfRenderFrame = function () {
    this._lastBeforeStartOfFrame = this.head;
};

/**
 * Reduces the size of the queue to a specified size by unloading the least-recently used
 * tiles.  Tiles that were used last frame will not be unloaded, even if that puts the number
 * of tiles above the specified maximum.
 *
 * @param {Number} maximumTiles The maximum number of tiles in the queue.
 */
TileReplacementQueue.prototype.trimTiles = function (maximumTiles) {
    var tileToTrim = this.tail;
    var keepTrimming = true;
    while (keepTrimming &&
           typeof this._lastBeforeStartOfFrame !== 'undefined' &&
           this.count > maximumTiles &&
           typeof tileToTrim !== 'undefined') {
        console.log(this.count > maximumTiles, typeof tileToTrim !== 'undefined', typeof this._lastBeforeStartOfFrame !== 'undefined')
        // Stop trimming after we process the last tile not used in the
        // current frame.
        keepTrimming = tileToTrim !== this._lastBeforeStartOfFrame;

        var previous = tileToTrim.replacementPrevious;

        if (tileToTrim.eligibleForUnloading) {
            console.log(tileToTrim)
            tileToTrim.freeResources();
            remove(this, tileToTrim);
        }

        tileToTrim = previous;
    }
};

function remove (tileReplacementQueue, item) {
    var previous = item.replacementPrevious;
    var next = item.replacementNext;

    if (item === tileReplacementQueue._lastBeforeStartOfFrame) {
        tileReplacementQueue._lastBeforeStartOfFrame = next;
    }

    if (item === tileReplacementQueue.head) {
        tileReplacementQueue.head = next;
    } else {
        previous.replacementNext = next;
    }

    if (item === tileReplacementQueue.tail) {
        tileReplacementQueue.tail = previous;
    } else {
        next.replacementPrevious = previous;
    }

    item.replacementPrevious = undefined;
    item.replacementNext = undefined;

    --tileReplacementQueue.count;
}

/**
 * Marks a tile as rendered this frame and moves it before the first tile that was not rendered
 * this frame.
 *
 * @param {TileReplacementQueue} item The tile that was rendered.
 */
TileReplacementQueue.prototype.markTileRendered = function (item) {
    var head = this.head;
    if (head === item) {
        if (item === this._lastBeforeStartOfFrame) {
            this._lastBeforeStartOfFrame = item.replacementNext;
        }
        return;
    }

    ++this.count;
    if (typeof head === 'undefined') {
        // no other tiles in the list
        item.replacementPrevious = undefined;
        item.replacementNext = undefined;
        this.head = item;
        this.tail = item;
        return;
    }

    if (typeof item.replacementPrevious !== 'undefined' || typeof item.replacementNext !== 'undefined') {
        // tile already in the list, remove from its current location
        remove(this, item);
    }

    item.replacementPrevious = undefined;
    item.replacementNext = head;
    head.replacementPrevious = item;

    this.head = item;
};

module.exports = TileReplacementQueue;