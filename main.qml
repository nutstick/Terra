import QtQuick 2.7
import QtCanvas3D 1.1
import QtQuick.Window 2.2
import QtQuick.Scene3D 2.0

import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Input 2.0
import Qt3D.Logic 2.0
import Qt3D.Extras 2.0

import com.map.cameracontroller 1.0

import "glcode.js" as GLCode

Item {
    width: 640
    height: 360
    visible: true

    WorkerScript {
        id: updater
        source: "worker/updatetile.js"

        onMessage: {
            var queue = messageObject.getTiles[0].length;

            if (queue > 0) {
                console.log('getTiles', JSON.stringify(messageObject.getTiles))
                GLCode.getTiles(messageObject.getTiles);
                GLCode.updateTileVisibility();
            }
        }
    }

    WorkerScript {
        id: parser
        source: "worker/parseelevation.js"

        onMessage: {
            var time = Date.now();
            canvas3d.parserRequests++
            if(messageObject.makeMesh) GLCode.makeMesh(messageObject.makeMesh)
            else console.log(messageObject)
        }
    }

    Compass {
        id: compass
    }

    /* Canvas {
        id: imageRenderer

        width: 512
        height: 512
    } */

    Scene3D {
        anchors.fill: parent
        aspects: ["render", "logic", "input"]

        Entity {
            id: sceneRoot
            property bool ready: false

            FrameAction {
                onTriggered: {
                    sceneRoot.animate()
                }
            }

            CameraController {
                id: controller
                camera: camera
                viewport:
            }

            Camera {
                id: camera
                projectionType: CameraLens.PerspectiveProjection
                fieldOfView: 70
                aspectRatio: width / height
                nearPlane: 1/99
                farPlane: 100000000000000
                position: Qt.vector3d(0, 0, 12000);
                upVector: Qt.vector3d( 0.0, 1.0, 0.0 )
                viewCenter: Qt.vector3d( 0.0, 0.0, 0.0 )
//                fieldOfView: 45
//                aspectRatio: 16/9
//                nearPlane : 0.1
//                farPlane : 1000.0
//                position: Qt.vector3d( 0.0, 40.0, -40.0 )
//                upVector: Qt.vector3d( 0.0, 1.0, 0.0 )
//                viewCenter: Qt.vector3d( 0.0, 0.0, 0.0 )
            }

            components: [
                MapFrameGraph {
                    id: framegraph
                    camera: camera
                },
                InputSettings {}
            ]

            Component.onCompleted: {
                ready = true;
            }

            function animate() {
                if (!ready)
                    return;
                // updateCamera();
            }

            /* Plane */
//            BasePlane {
//                id: basePlane
//            }

            PhongMaterial {
                id: material
            }

            TorusMesh {
                id: torusMesh
                radius: 500
                minorRadius: 100
                rings: 100
                slices: 20
            }

            Transform {
                id: torusTransform
                // scale3D: Qt.vector3d(1.5, 1, 0.5)
                // rotation: fromAxisAndAngle(Qt.vector3d(1, 0, 0), 45)
            }

            Entity {
                id: torusEntity
                components: [ torusMesh, material, torusTransform ]
            }
        }
    }
    /*
    Canvas3D {
        id: canvas3d

        property int parserRequest: 0
        property int tilesToGet: 0
        property bool inspectElevation: false

        anchors.fill: parent
        focus: true

        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
        }

        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource
        }
    }
    */

    Text {
        id: progress

        text: qsTr("loading")
    }
}
