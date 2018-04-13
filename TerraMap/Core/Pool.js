/**
 * 
 * @param {Object} options 
 * @param {function} options.create
 * @param {number} [options.size=16]
 */
function Pool (options) {
    if (!options) throw new Error('No options provided');
    if (!options.create) throw new Error('No options.create provided');

    var size = options.size || 16;

    this.create = options.create;

    this._values = [];

    for (var i = 0; i < size; i++) {
        this._values.push(this.create());
    }
}

// Pool.prototype.constructor = Pool;

Pool.prototype.duplicate = function () {
    const length = this._values.length;
    for (var i = 0; i < length; i++) {
        this._values.push(this.create());
    }
}

Pool.prototype.get = function (index) {
    return this._values[index];
}

Object.defineProperties(Pool.prototype, {
    length: {
        get: function () {
            return this._values.length;
        },
        set: function (length) {
            this._values.length = length;
        }
    }
})

module.exports = Pool;
