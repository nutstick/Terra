function highwaterDecode (indices) {
    var arr = [];

    var highest = 0;
    for (var i = 0; i < indices.length; ++i) {
        var code = indices[i];
        arr.push(highest - code);
        if (code === 0) {
            ++highest;
        }
    }
    return arr;
}

function zigZagDecode (value) {
    return (value >> 1) ^ (-(value & 1));
}

function getUint32Array (data, startPos, count) {
    return new Uint32Array(data.slice(startPos, startPos + 4 * count));
}
function getUint32 (data, startPos) {
    return getUint32Array(data, startPos, 1)[0];
}
function getUint16Array (data, startPos, count) {
    return new Uint16Array(data.slice(startPos, startPos + 2 * count));
}
function getUint16 (data, startPos) {
    return getUint16Array(data, startPos, 1)[0];
}
function getFloat64Array (data, startPos, count) {
    return new Float64Array(data.slice(startPos, startPos + 8 * count));
}
function getFloat64 (data, startPos) {
    return getFloat64Array(data, startPos, 1)[0];
}
function getFloat32Array (data, startPos, count) {
    return new Float32Array(data.slice(startPos, startPos + 4 * count));
}
function getFloat32 (data, startPos) {
    return getFloat32Array(data, startPos, 1)[0];
}

module.exports = {
    zigZagDecode: zigZagDecode,
    highwaterDecode: highwaterDecode,
    getUint32: getUint32,
    getUint32Array: getUint32Array,
    getUint16: getUint16,
    getUint16Array: getUint16Array,
    getFloat64: getFloat64,
    getFloat64Array: getFloat64Array,
    getFloat32: getFloat32,
    getFloat32Array: getFloat32Array,
    UINT16_BYTE_SIZE: 2,
    UINT32_BYTE_SIZE: 4,
    FLOAT64_BYTE_SIZE: 8,
    FLOAT32_BYTE_SIZE: 4
};
