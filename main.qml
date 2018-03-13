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

    Compass {
        id: compass

        anchors.bottom: parent.bottom
        anchors.left: parent.left
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
            GLCode.map.generateGrid();
        }

        text: 'Grid'
        anchors.rightMargin: -75
        anchors.topMargin: 0
    }
}
