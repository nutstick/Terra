import * as THREE from 'three';
import { Tile2D } from '../SceneMode/Tile2D';
import { DataSource } from './DataSource';
import { DataSourceLayer } from './DataSourceLayer';

export class EPSG4326MapImageDataLayer extends DataSourceLayer {
    static layerName = 'EPSG:4326';

    static vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

            vUv = uv;
            vNormal = normalize( normalMatrix * normal );
            vViewPosition = -mvPosition.xyz;

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }
    `;
    static fragmentShader = `
        uniform sampler2D texture;
        uniform sampler2D texture2;
        uniform vec3 color;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            if ( vUv.y < 0.5) {
                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 );
                gl_FragColor = texture2D( texture2, halfvUv );
            } else {
                vec2 halfvUv = vec2( vUv.x, vUv.y * 2.0 - 1.0 );
                gl_FragColor = texture2D( texture, halfvUv );
            }

            // hack in a fake pointlight at camera location, plus ambient
            // vec3 normal = normalize( vNormal );
            // vec3 lightDir = normalize( vViewPosition );

            // float dotProduct = max( dot( normal, lightDir ), 0.0 ) + 0.2;

            // //gl_FragColor = vec4( mix( tColor.rgb, tColor2.rgb, tColor2.a ), 1.0 ) * dotProduct;

            // vec4 mix_c = tColor2 + tc * tColor2.a;
            // gl_FragColor = vec4( mix( tColor.rgb, mix_c.xyz, tColor2.a ), 1.0 ) * dotProduct;
            // gl_FragColor = vec4( vUv.x, vUv.y, 0.0, 1.0 );
        }
    `;

    constructor() {
        super();
    }

    processLoading(tile: Tile2D) {
        tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Loading;
    }

    processData(tile: Tile2D, data: [THREE.Texture, THREE.Texture]) {
        if (tile.material) {
            throw new Error('Material\'s already set up.');
        }
        const uniforms = {
            texture: { type: 't', value: data[0] },
            texture2: { type: 't', value: data[1] },
        };
        tile.material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: EPSG4326MapImageDataLayer.vertexShader,
            fragmentShader: EPSG4326MapImageDataLayer.fragmentShader,
        });

        tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Loaded;
    }

    processError(tile: Tile2D, error: Error) {
        tile.data.status[EPSG4326MapImageDataLayer.layerName] = DataSource.State.Idle;
    }
}
