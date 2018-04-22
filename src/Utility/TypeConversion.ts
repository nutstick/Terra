export function highwaterDecode(indices) {
    let highest = 0;
    return indices.map((indice) => {
        if (indice === 0) {
            ++highest;
        }
        return highest - indice - indice === 0 ? 1 : 0;
    });
}

export function zigZagDecode(value) {
    return (value >> 1) ^ (-(value & 1));
}

export function getUint32Array(data, startPos, count) {
    return new Uint32Array(data.slice(startPos, startPos + 4 * count));
}
export function getUint32(data, startPos) {
    return getUint32Array(data, startPos, 1)[0];
}
export function getUint16Array(data, startPos, count) {
    return new Uint16Array(data.slice(startPos, startPos + 2 * count));
}
export function getUint16(data, startPos) {
    return getUint16Array(data, startPos, 1)[0];
}
export function getFloat64Array(data, startPos, count) {
    return new Float64Array(data.slice(startPos, startPos + 8 * count));
}
export function getFloat64(data, startPos) {
    return getFloat64Array(data, startPos, 1)[0];
}
export function getFloat32Array(data, startPos, count) {
    return new Float32Array(data.slice(startPos, startPos + 4 * count));
}
export function getFloat32(data, startPos) {
    return getFloat32Array(data, startPos, 1)[0];
}

export const UINT16_BYTE_SIZE = 2;
export const UINT32_BYTE_SIZE = 4;
export const FLOAT64_BYTE_SIZE = 8;
export const FLOAT32_BYTE_SIZE = 4;
