import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Extras 2.0

Entity {
    id: root

    property double basePlaneDimension: 65024

    PlaneMesh {
        id: planeMesh
        width: 65024 * 10
        height: 65024 * 10
        meshResolution: Qt.size(2, 2)
    }

    WireframeMaterial {
        id: wireframeMaterial
        effect: WireframeEffect {}
        ambient: Qt.rgba( 0.2, 0.0, 0.0, 0.0 )
        diffuse: Qt.rgba( 0.8, 0.0, 0.0, 0.0 )
    }

//    property Transform transform: Transform {
//        rotationX: -0.5*Math.PI
//    }

    Transform {
        id: torusTransform
        translation: Qt.vector3d(0, -5, 0)
        // scale3D: Qt.vector3d(1.5, 1, 0.5)
        // rotation: fromAxisAndAngle(Qt.vector3d(1, 0, 0), 45)
        // rotationX: -0.5*Math.PI
    }

    components: [ planeMesh, wireframeMaterial, torusTransform ]
}
