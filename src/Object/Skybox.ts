import * as THREE from 'three';
import { MapSettings } from '../Core/MapSettings';

export class Skybox extends THREE.Mesh {
    constructor() {
        const skyboxTexture = new THREE.CubeTexture([]);
        skyboxTexture.format = THREE.RGBFormat;

        const loader = new THREE.ImageLoader();
        // loader.load('./2.png', (image) => {
        //     const getSide = (x, y) => {
        //         const size = 1024;

        //         const canvas = document.createElement('canvas');
        //         canvas.width = size;
        //         canvas.height = size;

        //         const context = canvas.getContext('2d');
        //         context.drawImage(image, - x * size, - y * size);

        //         return new THREE.Texture(canvas);
        //     };

        //     skyboxTexture.images[ 0 ] = getSide( 2, 1 ); // px
        //     skyboxTexture.images[ 1 ] = getSide( 0, 1 ); // nx
        //     skyboxTexture.images[ 2 ] = getSide( 1, 0 ); // py
        //     skyboxTexture.images[ 3 ] = getSide( 1, 2 ); // ny
        //     skyboxTexture.images[ 4 ] = getSide( 1, 1 ); // pz
        //     skyboxTexture.images[ 5 ] = getSide( 3, 1 ); // nz
        //     skyboxTexture.needsUpdate = true;
        // });
        const materialArray = [];
        for (let i = 0; i < 6; i++) {
            materialArray.push( new THREE.MeshBasicMaterial({
                color: 0x87ceeb,
                // wireframe: true,
                side: THREE.DoubleSide,
            }));
        }
        const skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        // const shader = THREE.ShaderLib.cube;
        // const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        // uniforms.tCube.texture = skyboxTexture;   // textureCube has been init before
        // const material_ = new THREE.ShaderMaterial({
        //     fragmentShader: shader.fragmentShader,
        //     vertexShader: shader.vertexShader,
        //     uniforms,
        // });

        super(
            new THREE.CubeGeometry(
                MapSettings.basePlaneDimension,
                MapSettings.basePlaneDimension,
                MapSettings.basePlaneDimension,
                1, 1, 1,
            ),
            skyMaterial,
        );
    }

    update
}
