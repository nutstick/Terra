import { DEGREES_PER_RADIAN, RADIANS_PER_DEGREE, TWO_PI } from './Constants';

export function toRadians(degrees: number) {
    return degrees * RADIANS_PER_DEGREE;
};

export function toDegrees(radians) {
    return radians * DEGREES_PER_RADIAN;
};

/**
 * Converts a longitude value, in radians, to the range [<code>-Math.PI</code>, <code>Math.PI</code>).
 *
 * @param {Number} angle The longitude value, in radians, to convert to the range [<code>-Math.PI</code>, <code>Math.PI</code>).
 * @returns {Number} The equivalent longitude value in the range [<code>-Math.PI</code>, <code>Math.PI</code>).
 *
 * @example
 * // Convert 270 degrees to -90 degrees longitude
 * var longitude = Cesium.Math.convertLongitudeRange(Cesium.Math.toRadians(270.0));
 */
export function convertLongitudeRange(angle: number) {
    const twoPi = TWO_PI;

    const simplified = angle - Math.floor(angle / twoPi) * twoPi;

    if (simplified < -Math.PI) {
        return simplified + twoPi;
    }
    if (simplified >= Math.PI) {
        return simplified - twoPi;
    }

    return simplified;
};

export function fog(distanceToCamera: number, density: number) {
    const scalar = distanceToCamera * density;
    return 1.0 - Math.exp(-(scalar * scalar));
};

export function sign(value) {
    value = +value;
    if (value === 0 || value !== value) {
        return value;
    }
    return value > 0 ? 1 : -1;
}