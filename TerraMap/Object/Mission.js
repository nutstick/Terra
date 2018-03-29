/**
 * Mission Class
 * @alias Mission
 * @constructor
 *
 * @param {Object} options
 * @param {Map} options.map
 */
function Mission (options) {
    if (!options) throw new Error('No options provided');
    if (typeof options.map === 'undefined') throw new Error('No options.map provided');
    /**
     *
     * @type {Map} Map
     * @private
     */
    this._map = options.map;

    throw new Error('Not implemented');
}

Mission.prototype.addPin = function (position, height) {
    throw new Error('Not implemented');
};

Mission.prototype.updatePin = function (index) {
    throw new Error('Not implemented');
};

Mission.prototype.clearPins = function () {
    throw new Error('Not implemented');
};

Mission.prototype.reindex = function (pin, index) {
    // TODO:
    throw new Error('Not implemented');
};

Mission.prototype.interactableObjects = function () {
    throw new Error('Not implemented');
};

module.exports = Mission;
