import { Map3D } from '../Core/Map3D';
import { Cartesian } from '../Math/Cartesian';
import { OrbitControls } from '../Renderer/OrbitControls';
import { Pin } from './Pin';
import { RenderingObject } from './RenderingObject';

export interface MissionOptions {
    map: Map3D;
}

export abstract class Mission extends RenderingObject {
    _map: Map3D;
    constructor(options: MissionOptions) {
        super();
        this._map = options.map;
    }

    // abstract addPin(position: Cartographic | Cartesian, height: number)
    abstract updatePin(index: number);
    // abstract clearPins();
    // abstract reindex(pin: Pin, index: number);
    abstract interactableObjects(): THREE.Mesh[];

    abstract onMouseDown(controls: OrbitControls, x: number, y: number, button: number): boolean;
    abstract onMouseMove(controls: OrbitControls, x: number, y: number): boolean;

    abstract get pins(): Pin[];
}
