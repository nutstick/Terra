import * as THREE from 'three';
import { Camera } from '../Renderer/Camera';
import { Cartesian } from './Cartesian';
import { Plane } from './Plane';

const cameraCartesianPosition = new Cartesian();

export class AABB extends THREE.Box3 {
    public center: Cartesian = new Cartesian();

    constructor(min?: Cartesian, max?: Cartesian) {
        super(min, max);
        this.center.addVectors(this.min, this.max).divideScalar(2);
    }

    public distanceToCamera(camera: Camera) {
        cameraCartesianPosition.set(
            camera.position.x + camera.target.x,
            camera.position.y + camera.target.y,
            camera.position.z + camera.target.z,
        );
        return this.distanceToPoint(cameraCartesianPosition);
    }
}

// export class AABB {
//     public minimum: Cartesian;
//     public maximum: Cartesian;
//     public center: Cartesian;

//     constructor(minimum: Cartesian, maximum: Cartesian, center?: Cartesian) {
//         this.minimum = minimum.clone() || Cartesian.ZERO;
//         // Compute the normal of the plane on the western edge of the tile.
//         this.center = center || Cartesian.midpoint(this.minimum, this.maximum, new Cartesian());
//     }

//     public clone() {
//         return new AABB(this.minimum, this.maximum, this.center);
//     }

//     public equals(box: AABB) {
//         return (this === box) ||  (
//             this.minimum.equals(box.minimum) &&
//             this.maximum.equals(box.maximum) &&
//             this.center.equals(box.center)
//         );
//     }

//     public intersectPlane(plane: Plane) {
//         intersectScratch.subVectors(this.maximum, this.minimum);
//         const h = intersectScratch.multiplyScalar(0.5); // The positive half diagonal
//         const normal = plane.normal;
//         const e = h.x * Math.abs(normal.x) + h.y * Math.abs(normal.y) + h.z * Math.abs(normal.z);
//         const s = this.center.dot(normal) + plane.distance; // signed distance from center

//         if (s - e > 0) {
//             return Intersect.INSIDE;
//         }

//         if (s + e < 0) {
//             // Not in front because normals point inward
//             return Intersect.OUTSIDE;
//         }

//         return Intersect.INTERSECTING;
//     }
//     intersects(x, y, z) {
//         if (x instanceof AABB) {
//             const other = x;
//             return this.xMin < other.xMax && other.xMin < this.xMax &&
//                 this.yMin < other.yMax && other.yMin < this.yMax &&
//                 this.zMin < other.zMax && other.zMin < this.zMax;
//         }
//         return this.xMin <= x && this.xMax >= x &&
//             this.yMin <= y && this.yMax >= y &&
//             this.zMin <= z && this.zMax >= z;
//     }

//     onRect(x, z) {
//         return this.xMin <= x && this.xMax >= x &&
//             this.zMin <= z && this.zMax >= z;
//     }

//     distanceToCamera(camera: Camera) {
//         cameraCartesianPosition.set(
//             camera.position.x + camera.target.x,
//             camera.position.y + camera.target.y,
//             camera.position.z + camera.target.z,
//         );
//         return this.distanceFromPoint(cameraCartesianPosition);
//     }

//     distanceFromPoint(cartesian) {
//         const temp = new Cartesian();
//         let result = 0.0;
//         if (!this.onRect(cartesian.x, cartesian.z)) {
//             const northwestCornnerCartesian = this.northwestCornnerCartesian;
//             const southeastCornnerCartesian = this.southeastCornnerCartesian;
//             const westNormal = this.westNormal;
//             const southNormal = this.southNormal;
//             const eastNormal = this.eastNormal;
//             const northNormal = this.northNormal;
//             const vectorFromNorthwestCorner = temp.subVectors(cartesian, northwestCornnerCartesian);
//             const distanceToWestPlane = vectorFromNorthwestCorner.dot(westNormal);
//             const distanceToNorthPlane = vectorFromNorthwestCorner.dot(northNormal);
//             const vectorFromSoutheastCorner = temp.subVectors(cartesian, southeastCornnerCartesian);
//             const distanceToEastPlane = vectorFromSoutheastCorner.dot(eastNormal);
//             const distanceToSouthPlane = vectorFromSoutheastCorner.dot(southNormal);
//             if (distanceToWestPlane > 0.0) {
//                 result += distanceToWestPlane * distanceToWestPlane;
//             } else if (distanceToEastPlane > 0.0) {
//                 result += distanceToEastPlane * distanceToEastPlane;
//             }
//             if (distanceToSouthPlane > 0.0) {
//                 result += distanceToSouthPlane * distanceToSouthPlane;
//             } else if (distanceToNorthPlane > 0.0) {
//                 result += distanceToNorthPlane * distanceToNorthPlane;
//             }
//         }
//         const height = cartesian.height;
//         const distanceFromTop = height;
//         if (distanceFromTop > 0.0) {
//             result += distanceFromTop * distanceFromTop;
//         }
//         return Math.sqrt(result);
//     }

//     get corner() {
//         return this._corner;
//     }

//     get width() {
//         return this.xMax - this.xMin;
//     }

//     get height() {
//         return this.zMax - this.zMin;
//     }
// }
