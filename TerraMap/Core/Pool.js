/**
 * 
 * @param {Object} options 
 * @param {function} options.create
 * @param {number} [options.size=16]
 */
function Pool (options) {
    if (!options) throw new Error('No options provided');
    if (!options.create) throw new Error('No options.create provided');

    this._length = options.size || 16;

    this.create = options.create;

    this._usingNodes = {};

    this._freeNodes = [];

    for (var i = 0; i < this._length; i++) {
        this._freeNodes.push(this.create());
    }
}

// Pool.prototype.constructor = Pool;

Pool.prototype.duplicate = function () {
    const length = this.length;
    for (var i = 0; i < this._length; i++) {
        this._freeNodes.push(this.create());
    }
    this._length *= 2;
}

Pool.prototype.get = function (index) {
    return this._usingNodes[index];
}

Pool.prototype.use = function (index) {
    var node = this._freeNodes.pop();

    this._usingNodes[index] = node;

    return node;
}

Pool.prototype.free = function (index) {
    var node = this._usingNodes[index];
    delete this._usingNodes[index];

    this._freeNodes.push(node);
}

Object.defineProperties(Pool.prototype, {
    length: {
        get: function () {
            return this._length;
        }
    }
})

module.exports = Pool;
