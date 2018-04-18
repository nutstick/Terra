function DataSourceLayer () {
    throw new Error('This function defines an interface and should not be called directly.');
}

Object.defineProperties(DataSourceLayer.prototype, {
    name: {
        get: function () {
            throw new Error('This function defines an interface and should not be called directly.');
        }
    }
});

module.exports = DataSourceLayer;
