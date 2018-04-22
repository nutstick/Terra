import * as THREE from 'three';
import { STKTerrainTile } from '../SceneMode/STKTerrainTile';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

export type STKTerrainData = [number[], number[], number[], number[], number[]];

export class STKTerrainDataLayer extends DataSourceLayer {
    static layerName = 'terrain-stk';
    static meshScale: 1024;

    constructor() {
        super();
    }

    getVertices(header, uArray, vArray, heightArray, indexArray) {
        const h = header.maximumHeight - header.minimumHeight;
        return uArray.map((u, index) => {
            console.log(new THREE.Vector3(
                u * STKTerrainDataLayer.meshScale / 32767 - STKTerrainDataLayer.meshScale / 2,
                heightArray[index] / 32767 * header.minimumHeight,
                -vArray[index] * STKTerrainDataLayer.meshScale / 32767 + STKTerrainDataLayer.meshScale / 2,
            ))
            return new THREE.Vector3(
                u * STKTerrainDataLayer.meshScale / 32767 - STKTerrainDataLayer.meshScale / 2,
                heightArray[index] / 32767 * header.minimumHeight,
                -vArray[index] * STKTerrainDataLayer.meshScale / 32767 + STKTerrainDataLayer.meshScale / 2,
            );
        });
    }

    getFaces(header, uArray, vArray, heightArray, indexArray) {
        return indexArray.map((_, index) =>
            new THREE.Face3(
                indexArray[index + 0],
                indexArray[index + 1],
                indexArray[index + 2],
            ));
    }

    getFaceVertexUvs(header, uArray, vArray, heightArray, indexArray) {
        const verticesUv = uArray.map((u, index) =>
            new THREE.Vector2(
                u / 32767,
                vArray[index] / 32767,
            ));

        return indexArray.map((_, index) => [
            verticesUv[indexArray[index + 0]],
            verticesUv[indexArray[index + 0]],
            verticesUv[indexArray[index + 0]],
        ]);
    }

    processData(tile: STKTerrainTile, data: STKTerrainData) {
        const header = data[0];
        const uArray = data[1];
        const vArray = data[2];
        const heightArray = data[3];
        const indexArray = data[4];

        const vertices = this.getVertices(header, uArray, vArray, heightArray, indexArray);
        const faces = this.getFaces(header, uArray, vArray, heightArray, indexArray);

        console.log('v', this.getVertices(header, uArray, vArray, heightArray, indexArray))
        tile._geometry = new THREE.Geometry();
        tile._geometry.vertices = vertices;
        tile._geometry.faces = faces;

        tile._geometry.computeFaceNormals();
        tile._geometry.computeVertexNormals();
        tile._geometry.faceVertexUvs[0] = this.getFaceVertexUvs(header, uArray, vArray, heightArray, indexArray);
        tile._geometry.uvsNeedUpdate = true;
    }

    processError(tile: STKTerrainTile, error: Error) {
        throw new Error('Debug data can\'t be error.');
    }
}
