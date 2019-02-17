import * as THREE from 'three';
import { sphericalMercator } from './SphericalMercator';

const screenPosition = new THREE.Vector2();

export class MapUtility {
    static ground(position) {
        const _ = position.clone();
        // FIXME: ground = 0 by now
        _.y = 0;
        return _;
    }

    static tenMeters(latitude?: number) {
        return 10 / (latitude ? sphericalMercator.mPerPixel(latitude) : sphericalMercator.meterPerPixel);
    }

    static rayCasterFromScreen(primitive, x, y, picker) {
        screenPosition.set((x / primitive.canvas.width) * 2 - 1, -(y / primitive.canvas.height) * 2 + 1);
        picker.setFromCamera(screenPosition, primitive.camera);

        return picker;
    }

    static lerp(p, q, time) {
        return ((1.0 - time) * p) + (time * q);
    }
}
