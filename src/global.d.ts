declare interface Cartographic {
    latitude: number;
    longitude: number;
    altitude: number;
}

declare module QtPositioning {
    function coordinate(x?: number, y?: number, z?: number): Cartographic;
}

declare var Qt: any;
declare var timer: any;
declare var optimizeGridCalculation: any;
declare var gridcalculation: any;

type QtEventSource = any;
declare interface QtCanvas {
    width: number;
    height: number;
    devicePixelRatio: number;
}

type Context2D = any;
