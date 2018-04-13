import QtQuick 2.7
import QtCanvas3D 1.1
import QtQuick.Window 2.3
import QtQuick.Controls 1.4
import QtPositioning 5.2

import "glcode.js" as GLCode

QtObject {
    property var mainWindow: Window {
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
                GLCode.initializeGL(canvas3d, canvas2d.getContext('2d'), eventSource);
                // controlWindow.onMapChanged(GLCode.map);
            }

            onPaintGL: {
                GLCode.paintGL(canvas3d, canvas2d.getContext('2d'));
                // controlWindow.onMapUpdate();
            }

            onResizeGL: {
                GLCode.resizeGL(canvas3d, canvas2d.getContext('2d'));
            }

            ControlEventSource {
                anchors.fill: parent
                focus: true
                id: eventSource
            }
        }

        Canvas {
            id: canvas2d
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

    // property var controlWindow: ControlWindow { }
}
