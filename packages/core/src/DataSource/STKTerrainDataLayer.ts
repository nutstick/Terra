import * as THREE from 'three';
import { TileReplacementQueue } from '../Core/TileReplacementQueue';
import { STKTerrainTile } from '../SceneMode/STKTerrainTile';
import { MapUtility } from '../Utility/MapUtility';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';
import { QuantizedMesh } from './STKTerrainProvider';

const maxShort = 32767;

export class STKTerrainDataLayer extends DataSourceLayer {
    static layerName = 'terrain-stk';

    constructor() {
        super();
    }

    getVertices(header, uArray, vArray, heightArray, indexArray) {
        return uArray.reduce((prev, _, index) => {
            prev.push(new THREE.Vector3(
                uArray[index] / maxShort - 0.5,
                MapUtility.lerp(header.minimumHeight, header.maximumHeight, heightArray[index] / maxShort)
                    + header.minimumHeight,
                0.5 - vArray[index] / maxShort,
            ));
            return prev;
        }, []);
    }

    getFaces(header, uArray, vArray, heightArray, indexArray) {
        const faces = [];
        for (let i = 0; i < indexArray.length; i += 3) {
            faces.push(new THREE.Face3(indexArray[i + 0], indexArray[i + 1], indexArray[i + 2]));
        }
        return faces;
    }

    getFaceVertexUvs(header, uArray, vArray, heightArray, indexArray) {
        const verticesUv = uArray.reduce((prev, _, index) => {
            prev.push(new THREE.Vector2(
                uArray[index] / 32767,
                vArray[index] / 32767,
            ));
            return prev;
        }, []);

        const faceVertexUvs = [];
        for (let i = 0; i < indexArray.length; i += 3) {
            faceVertexUvs.push([
                verticesUv[indexArray[i + 0]],
                verticesUv[indexArray[i + 1]],
                verticesUv[indexArray[i + 2]],
            ]);
        }
        return faceVertexUvs;
    }

    processLoading(tile: STKTerrainTile) {
        tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Loading;
    }

    processData(tile: STKTerrainTile, data: QuantizedMesh) {
        const header = data.header;
        const uArray = data.uArray;
        const vArray = data.vArray;
        const heightArray = data.heightArray;
        const indexArray = data.indexArray;

        const vertices = this.getVertices(header, uArray, vArray, heightArray, indexArray);
        const faces = this.getFaces(header, uArray, vArray, heightArray, indexArray);

        tile.geometry = new THREE.Geometry();
        tile.geometry.vertices = vertices;
        tile.geometry.faces = faces;

        tile.geometry.computeFaceNormals();
        tile.geometry.computeVertexNormals();
        tile.geometry.faceVertexUvs[0] = this.getFaceVertexUvs(header, uArray, vArray, heightArray, indexArray);
        tile.geometry.uvsNeedUpdate = true;

        // tile.bbox.yMin = header.minimumHeight;
        // tile.bbox.yMax = header.maximumHeight;
        // console.log(tile.bbox.center, header.centerX, header.centerY, header.centerZ)

        tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: STKTerrainTile, error: Error) {
        tile.data.status[STKTerrainDataLayer.layerName] = DataSource.State.Idle;
    }
}
