import { Cartesian } from '../Math/Cartesian';

export abstract class RenderingObject {
    abstract updateTarget(target: Cartesian);

    abstract coordinate(): Cartographic;

    abstract getScale(): number;
    abstract setScale(scale: number);
}
