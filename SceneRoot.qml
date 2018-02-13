import Qt3D.Core 2.0
import Qt3D.Input 2.0
import Qt3D.Logic 2.0
import Qt3D.Render 2.0
import Qt3D.Extras 2.0

import com.terra 1.0

Entity {
    id: sceneRoot
    readonly property Map map: _map

    FrameAction {
        onTriggered:
            _map.update();
    }

    CameraController {
        id: controller
        map: _map
        camera: camera
        viewport: Qt.rect(0, 0, root.width, root.height)
    }

    MyCamera {
        id: camera
        projectionType: CameraLens.PerspectiveProjection
        aspectRatio: width / height
    }

    components: [
        RenderSettings {
            id: renderSettings
//            activeFrameGraph: ForwardRenderer {
//                clearColor: Qt.rgba(0, 0.5, 1, 1)
//                camera: camera
//            }
            activeFrameGraph: MapForwardRenderer {

                camera: camera
            }
//                    pickingSettings.pickMethod: PickingSettings.TrianglePicking
//                    pickingSettings.faceOrientationPickingMode: PickingSettings.FrontAndBackFace
//                    pickingSettings.pickResultMode: PickingSettings.AllPicks
            renderPolicy: RenderSettings.OnDemand
        },
        InputSettings {}
    ]

    Map {
        id: _map
        cameraController: controller
        layer: renderSettings.activeFrameGraph.mapLayer

        entities: [
            Marker {
                id: marker
                position: Qt.vector3d( 0.0, 0.0, 0.0 )
                layer: renderSettings.activeFrameGraph.entityLayer
                camera: camera
                map: _map
                cameraController: controller
            }
        ]
    }

//    Entity {
//        components: [m, t, mat, p]
//                CylinderMesh {
//                    id: m
//                }
//        CuboidMesh {
//            id: m
//        }

//        Transform {
//            id: t
//            translation: Qt.vector3d(2, 0, 10)
//            scale3D: Qt.vector3d(100, 100, 100)
//        }
//        PhongMaterial {
//            id: mat
//            ambient: "#FF0000"
//        }
//        ObjectPicker {
//            id: p
//            onClicked: console.log('px')
//        }
//    }
}
