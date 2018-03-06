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
            GLCode.map.setView(QtPositioning.coordinate(13.738521, 100.530987), 19);
        }

        text: 'TO CU'
    }
    Button {
        id: returnGridButton
        x: 0
        anchors.top: parent.top
        anchors.right: parent.left

        onClicked: {
            var points = GLCode.map._currentMission.generateGrid(4, 0);
        }

        text: 'Grid'
        anchors.rightMargin: -75
        anchors.topMargin: 0
    }
}
