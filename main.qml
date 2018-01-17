import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Window 2.2
import QtQuick.Controls 1.4

import "glcode.js" as GLCode

Window {
    title: qsTr("terra")
    width: 640
    height: 360
    visible: true

    WorkerScript {
        id: updater
        source: "worker/updatetile.js"

        onMessage: {
            var queue = messageObject.getTiles[0].length;

            if (queue > 0) {
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

    Canvas3D {
        id: canvas3d

        property int parserRequest: 0
        property int tilesToGet: 0
        property bool inspectElevation: false

        anchors.fill: parent
        focus: true

        states: [
            State {
                name: "View"
            },
            State {
                name: "Edit"
            }
        ]

        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
            state = 'View'
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

    Compass {
        id: compass

        anchors.bottom: parent.bottom
        anchors.left: parent.left
    }

    Button {
        id: modeButton
        anchors.top: parent.top
        anchors.right: parent.right

        onClicked: canvas3d.state = canvas3d.state == 'View' ? 'Edit' : 'View'

        text: canvas3d.state == 'View' ? 'View Mode' : 'Edit Mode'
    }

    Text {
        id: progress
        anchors.verticalCenter: parent.verticalCenter
        anchors.horizontalCenter: parent.horizontalCenter
        color: "white"

        text: qsTr("loading")
    }
}
