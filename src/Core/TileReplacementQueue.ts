import { Tile } from '../SceneMode/Tile';

export class TileReplacementQueue {
    head: Tile;
    tail: Tile;
    count: number;
    _lastBeforeStartOfFrame: Tile;

    constructor() {
        this.head = undefined;
        this.tail = undefined;
        this.count = 0;
        this._lastBeforeStartOfFrame = undefined;
    }
    /**
     * Marks the start of the render frame.  Tiles before (closer to the head) this tile in the
     * list were used last frame and must not be unloaded.
     */
    markStartOfRenderFrame() {
        this._lastBeforeStartOfFrame = this.head;
    }
    /**
     * Reduces the size of the queue to a specified size by unloading the least-recently used
     * tiles.  Tiles that were used last frame will not be unloaded, even if that puts the number
     * of tiles above the specified maximum.
     *
     * @param {Number} maximumTiles The maximum number of tiles in the queue.
     */
    trimTiles(maximumTiles: number) {
        let tileToTrim = this.tail;
        let keepTrimming = true;
        while (keepTrimming &&
            this._lastBeforeStartOfFrame &&
            this.count > maximumTiles &&
            tileToTrim) {
            // Stop trimming after we process the last tile not used in the
            // current frame.
            keepTrimming = tileToTrim !== this._lastBeforeStartOfFrame;

            const previous = tileToTrim.replacementPrevious;

            if (tileToTrim.eligibleForUnloading) {
                remove(this, tileToTrim);
                tileToTrim.dispose();
            }
            tileToTrim = previous;
        }

        // if (this.count > maximumTiles) {
        // let tileToTrim2 = this.tail;
        // while(tileToTrim2) {
        //     const previous = tileToTrim2.replacementPrevious;
        //     console.log(tileToTrim2.stringify, tileToTrim2.quadTree._activeTiles.indexOf(tileToTrim2))
        //     tileToTrim2 = previous;
        // }
        // }
    }

    markTileRendered(item: Tile) {
        const head = this.head;
        if (head === item) {
            if (item === this._lastBeforeStartOfFrame) {
                this._lastBeforeStartOfFrame = item.replacementNext;
            }
            return;
        }
        ++this.count;
        if (!head) {
            // no other tiles in the list
            item.replacementPrevious = undefined;
            item.replacementNext = undefined;
            this.head = item;
            this.tail = item;
            return;
        }
        if (item.replacementPrevious || item.replacementNext) {
            // tile already in the list, remove from its current location
            remove(this, item);
        }
        item.replacementPrevious = undefined;
        item.replacementNext = head;
        head.replacementPrevious = item;

        this.head = item;
    }
}

function remove(tileReplacementQueue: TileReplacementQueue, item: Tile) {
    const previous = item.replacementPrevious;
    const next = item.replacementNext;

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
