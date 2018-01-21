import QtQuick 2.7
import QtCanvas3D 1.1
import QtQuick.Window 2.2
import QtQuick.Scene3D 2.0

import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Input 2.0
import Qt3D.Logic 2.0
import Qt3D.Extras 2.0

import com.terra.cameracontroller 1.0
import com.terra.map 1.0

import "glcode.js" as GLCode

Item {
    id: root
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
                onTriggered:
                    map.update();
            }

            CameraController {
                id: controller
                map: map
                camera: camera
                viewport: Qt.rect(0, 0, root.width, root.height)
            }

            Camera {
                id: camera
                projectionType: CameraLens.PerspectiveProjection
                fieldOfView: 70
                aspectRatio: width / height
                nearPlane: 1/99
                farPlane: 100000000000000
                position: Qt.vector3d( 0.0, 12000.0, 0.0 );
                upVector: Qt.vector3d( 1.0, 0.0, 0.0 )
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
            }

            Map {
                id: map
                cameraController: controller
                tau: 0.0001
                maxLevel: 22
            }
        }
    }

    Text {
        id: progress

        text: qsTr("loading")
    }
}
