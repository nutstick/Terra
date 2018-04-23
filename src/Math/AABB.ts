import { Camera } from '../Renderer/Camera';
import { Cartesian } from './Cartesian';

export interface AABBOptions {
    topLeftCorner: Cartesian;
    bottomRightCorner: Cartesian;
}

const UNIT_Y = new Cartesian({ x: 0.0, y: 1.0, z: 0.0 });
const t = [[0, 0], [0, 1], [1, 1], [1, 0]];
const c = new Cartesian();
const cameraCartesianPosition = new Cartesian();

export class AABB {
    xMin: number;
    yMin: number;
    zMin: number;
    xMax: number;
    yMax: number;
    zMax: number;
    westNormal: Cartesian;
    eastNormal: Cartesian;
    northNormal: Cartesian;
    southNormal: Cartesian;
    northwestCornnerCartesian: Cartesian;
    southeastCornnerCartesian: Cartesian;
    _corner: Cartesian[];

    constructor(options: AABBOptions) {
        this.xMin = options.topLeftCorner.x || 0;
        this.yMin = options.topLeftCorner.y || 0;
        this.zMin = options.topLeftCorner.z || 0;
        this.xMax = options.bottomRightCorner.x || 0;
        this.yMax = options.bottomRightCorner.y || 0;
        this.zMax = options.bottomRightCorner.z || 0;

        // Compute the normal of the plane on the western edge of the tile.
        const midPoint = new Cartesian();
        midPoint.x = (this.xMax + this.xMin) / 2;
        midPoint.z = (this.zMax + this.zMin) / 2;
        const temp2 = new Cartesian();
        const westernMidpointCartesian = new Cartesian();
        westernMidpointCartesian.x = (this.xMax + this.xMin) / 2;
        westernMidpointCartesian.z = this.zMin;
        this.westNormal = new Cartesian();
        this.westNormal.crossVectors(temp2.subVectors(midPoint, westernMidpointCartesian), UNIT_Y);
        this.westNormal.normalize();
        const easternMidpointCartesian = new Cartesian();
        easternMidpointCartesian.x = (this.xMax + this.xMin) / 2;
        easternMidpointCartesian.z = this.zMax;
        this.eastNormal = new Cartesian();
        this.eastNormal.crossVectors(temp2.subVectors(midPoint, easternMidpointCartesian), UNIT_Y);
        this.eastNormal.normalize();
        const northMidpointCartesian = new Cartesian();
        northMidpointCartesian.x = this.xMin;
        northMidpointCartesian.z = (this.zMax + this.zMin) / 2;
        this.northNormal = new Cartesian();
        this.northNormal.crossVectors(temp2.subVectors(midPoint, northMidpointCartesian), UNIT_Y);
        this.northNormal.normalize();
        const southMidpointCartesian = new Cartesian();
        southMidpointCartesian.x = this.xMax;
        southMidpointCartesian.z = (this.zMax + this.zMin) / 2;
        this.southNormal = new Cartesian();
        this.southNormal.crossVectors(temp2.subVectors(midPoint, southMidpointCartesian), UNIT_Y);
        this.southNormal.normalize();
        this.northwestCornnerCartesian = new Cartesian({ x: this.xMin, y: 0, z: this.zMin });
        this.southeastCornnerCartesian = new Cartesian({ x: this.xMax, y: 0, z: this.zMax });
        this._corner = new Array(4);
        for (let i = 0; i < 4; ++i) {
            // TODO: y
            this._corner[i] = new Cartesian({
                x: t[i][0] ? this.xMin : this.xMax,
                y: 0,
                z: t[i][1] ? this.zMin : this.zMax,
            });
        }
    }
    intersects(x, y, z) {
        if (x instanceof AABB) {
            const other = x;
            return this.xMin < other.xMax && other.xMin < this.xMax &&
                this.yMin < other.yMax && other.yMin < this.yMax &&
                this.zMin < other.zMax && other.zMin < this.zMax;
        }
        return this.xMin <= x && this.xMax >= x &&
            this.yMin <= y && this.yMax >= y &&
            this.zMin <= z && this.zMax >= z;
    }
    onRect(x, z) {
        return this.xMin <= x && this.xMax >= x &&
            this.zMin <= z && this.zMax >= z;
    }
    distanceToCamera(camera: Camera) {
        cameraCartesianPosition.set(
            camera.position.x + camera.target.x,
            camera.position.y + camera.target.y,
            camera.position.z + camera.target.z,
        );
        return this.distanceFromPoint(cameraCartesianPosition);
    }
    distanceFromPoint(cartesian) {
        const temp = new Cartesian();
        let result = 0.0;
        if (!this.onRect(cartesian.x, cartesian.z)) {
            const northwestCornnerCartesian = this.northwestCornnerCartesian;
            const southeastCornnerCartesian = this.southeastCornnerCartesian;
            const westNormal = this.westNormal;
            const southNormal = this.southNormal;
            const eastNormal = this.eastNormal;
            const northNormal = this.northNormal;
            const vectorFromNorthwestCorner = temp.subVectors(cartesian, northwestCornnerCartesian);
            const distanceToWestPlane = vectorFromNorthwestCorner.dot(westNormal);
            const distanceToNorthPlane = vectorFromNorthwestCorner.dot(northNormal);
            const vectorFromSoutheastCorner = temp.subVectors(cartesian, southeastCornnerCartesian);
            const distanceToEastPlane = vectorFromSoutheastCorner.dot(eastNormal);
            const distanceToSouthPlane = vectorFromSoutheastCorner.dot(southNormal);
            if (distanceToWestPlane > 0.0) {
                result += distanceToWestPlane * distanceToWestPlane;
            } else if (distanceToEastPlane > 0.0) {
                result += distanceToEastPlane * distanceToEastPlane;
            }
            if (distanceToSouthPlane > 0.0) {
                result += distanceToSouthPlane * distanceToSouthPlane;
            } else if (distanceToNorthPlane > 0.0) {
                result += distanceToNorthPlane * distanceToNorthPlane;
            }
        }
        const height = cartesian.height;
        const distanceFromTop = height;
        if (distanceFromTop > 0.0) {
            result += distanceFromTop * distanceFromTop;
        }
        return Math.sqrt(result);
    }

    get corner() {
        return this._corner;
    }

    get center() {
        c.set(
            (this.xMin + this.xMax) / 2,
            (this.yMin + this.yMax) / 2,
            (this.zMin + this.zMax) / 2,
        );
        return c;
    }
    get width() {
        return this.xMax - this.xMin;
    }
    get height() {
        return this.zMax - this.zMin;
    }
}
