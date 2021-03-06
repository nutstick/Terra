import * as THREE from 'three';
import { MapSettings } from '../Core/MapSettings';
import { Cartesian } from '../Math/Cartesian';
import { Ellipsoid } from '../Math/Ellipsoid';

export interface SphericalMercatorOptions {
    size?: number;
}

interface CacheSize {
    Bc?: number[];
    Cc?: number[];
    zc?: number[];
    Ac?: number[];
}

const EPSLN = 1.0e-10;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const cache: { [key: number]: CacheSize } = {};

export enum System {
    WGS84 = 0,
    EPSG4326 = 1,
    EPSG3857 = 2,
}

export class SphericalMercator {
    size: number;

    Ac: number[];
    zc: number[];
    Cc: number[];
    Bc: number[];

    meterPerPixel: number;

    constructor(options: SphericalMercatorOptions)  {
        this.size = options.size || 256;
        if (!cache[this.size]) {
            let size = this.size;
            const c: CacheSize = cache[this.size] = {};
            c.Bc = [];
            c.Cc = [];
            c.zc = [];
            c.Ac = [];
            for (let d = 0; d < 30; ++d) {
                c.Bc.push(size / 360);
                c.Cc.push(size / (2 * Math.PI));
                c.zc.push(size / 2);
                c.Ac.push(size);
                size *= 2;
            }
        }
        this.Bc = cache[this.size].Bc;
        this.Cc = cache[this.size].Cc;
        this.zc = cache[this.size].zc;
        this.Ac = cache[this.size].Ac;

        this.meterPerPixel = this.mPerPixel(0);
    }

    mPerPixel(latitude?: number) {
        latitude = latitude || 0;
        return Math.abs(Ellipsoid.WGS84.maximumRadius * 2 * Math.PI * Math.cos(latitude * Math.PI / 180) / this.size);
    }
    PixelToCartographic(px: THREE.Vector3, cartographic: Cartographic) {
        const g = (px.z + MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
        cartographic.longitude = Math.min((px.x + MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0],
            180 - EPSLN);
        cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
        const meterPerPixel = this.mPerPixel(cartographic.latitude);
        cartographic.altitude = px.y * meterPerPixel;
    }
    CartographicToPixel(coordinate: Cartographic, px: THREE.Vector3) {
        const d = this.zc[0];
        const f = Math.min(Math.max(Math.sin(D2R * coordinate.latitude), -0.9999), 0.9999);
        let x = (d + coordinate.longitude * this.Bc[0]);
        let y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
        if (x > this.Ac[0]) {
            x = this.Ac[0];
        }
        if (y > this.Ac[0]) {
            y = this.Ac[0];
        }

        // if (x < 0) x = 0;
        // if (y < 0) y = 0;
        px.x = x - MapSettings.basePlaneDimension / 2;
        px.y = coordinate.altitude / this.mPerPixel(0);
        px.z = y - MapSettings.basePlaneDimension / 2;
        return px;
    }
    /**
     * Convert given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
     * @param {QtPositioning.coordinate} coordinate
     * @param {Cartesian} cartesian
     *
     * @return {Cartesian}
     */
    CartographicToCartesian(cartographic: Cartographic, cartesian: Cartesian) {
        const d = this.zc[0];
        const f = Math.min(Math.max(Math.sin(D2R * cartographic.latitude), -0.9999), 0.9999);
        let x = (d + cartographic.longitude * this.Bc[0]);
        let y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
        if (x > this.Ac[0]) {
            x = this.Ac[0];
        }
        if (y > this.Ac[0]) {
            y = this.Ac[0];
        }

        // if (x < 0) x = 0;
        // if (y < 0) y = 0;
        cartesian.x = x - MapSettings.basePlaneDimension / 2;
        cartesian.y = cartographic.altitude / this.mPerPixel(0);
        cartesian.z = y - MapSettings.basePlaneDimension / 2;
        return cartesian;

        // TODO:
        // const longitude = cartographic.longitude;
        // const latitude = cartographic.latitude;
        // const mX = longitude * Ellipsoid.WGS84.a;
        // let mY = Math.log(Math.tan((90 + latitude) * D2R / 2)) * R2D;
        // mY = mY * Ellipsoid.WGS84.a / 180.0;
        // cartesian.x = mX;
        // cartesian.y = mY;
        // cartesian.height = cartographic.altitude;
        // return cartesian;
    }
    FCartographicToCartesian(cartographic: Cartographic, cartesian: Cartesian) {
        const d = this.zc[0];
        // const f = Math.min(Math.max(Math.sin(D2R * cartographic.latitude), -1), 1);
        const x = (d + cartographic.longitude * this.Bc[0]);
        const y = (d + 2 * cartographic.latitude * (-this.Bc[0]));
        // let y = (d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[0]));
        cartesian.x = x - MapSettings.basePlaneDimension / 2;
        cartesian.y = cartographic.altitude / this.mPerPixel(0);
        cartesian.z = y - MapSettings.basePlaneDimension / 2;
        return cartesian;
    }
    CartesianToCartographic(cartesian: Cartesian, cartographic: Cartographic) {
        const g = (cartesian.z + MapSettings.basePlaneDimension / 2 - this.zc[0]) / (-this.Cc[0]);
        cartographic.longitude = Math.min((cartesian.x + MapSettings.basePlaneDimension / 2 - this.zc[0]) / this.Bc[0],
            180 - EPSLN);
        cartographic.latitude = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
        const meterPerPixel = this.mPerPixel(cartographic.latitude);
        cartographic.altitude = cartesian.y * meterPerPixel;
    }

    CartographicToEPSG4326(cartographic: Cartographic, cartesian: Cartesian) {
        cartesian.x = cartographic.longitude / 90 * Ellipsoid.WGS84.maximumRadius;
        cartesian.y = cartographic.altitude;
        cartesian.z = cartographic.latitude / 90 * Ellipsoid.WGS84.maximumRadius;
    }
}

export const sphericalMercator = new SphericalMercator({ size: MapSettings.basePlaneDimension });
