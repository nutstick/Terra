import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Window 2.2
import QtQuick.Controls 1.4
import QtPositioning 5.2

import "glcode.js" as GLCode

Window {
    id: window
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

    WorkerScript {
        id: tileReplacementQueue
        source: "Core/TileReplacementQueue.js"

        onMessage: {
            console.log(messageObject)
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
        x: 544
        anchors.top: parent.top
        anchors.right: parent.right

        onClicked: {
            GLCode.map.suspendLodUpdate = canvas3d.state == 'Edit';
            canvas3d.state = canvas3d.state == 'View' ? 'Edit' : 'View'
        }

        text: canvas3d.state == 'View' ? 'View Mode' : 'Edit Mode'
        anchors.rightMargin: 0
        anchors.topMargin: 26
    }

    Button {
        id: setViewButton
        x: 0
        y: 0
        anchors.top: parent.top
        anchors.right: parent.right

        onClicked: {
            GLCode.map.setView(QtPositioning.coordinate(13.7419073, 100.5279612), 16);
        }

        text: 'TO CU'
    }
    Button {
        id: returnGridButton
        x: 0
        anchors.top: parent.top
        anchors.right: parent.left

        onClicked: {
            GLCode.map._currentMission.generateGrid();
        }

        text: 'Grid'
        anchors.rightMargin: -75
        anchors.topMargin: 0
    }

    Text {
        id: progress
        anchors.verticalCenter: parent.verticalCenter
        anchors.horizontalCenter: parent.horizontalCenter
        color: "white"

        text: qsTr("loading")
    }

//    PlannerView {
//        property real dHeight: 200
//        y: 160
//        width: Math.min(parent.width * 0.8, 400)
//        height: Math.max(56, dHeight)
//        anchors.horizontalCenterOffset: 0
//        anchors.bottomMargin: 0
//        anchors.bottom: parent.bottom
//        anchors.horizontalCenter: parent.horizontalCenter

//    }
}
