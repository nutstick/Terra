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
            var pts = [
                QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10),
                QtPositioning.coordinate(13.739013102055642, 100.53072382364125, 10),
                QtPositioning.coordinate(13.738934237108017, 100.53124540615603, 10),
                QtPositioning.coordinate(13.73829834824066, 100.53111367933914, 10)
            ]

            optimizeGridCalculation.genGridInsideBound(pts, 4, pts[0])
        }

        text: 'Grid'
        anchors.rightMargin: -75
        anchors.topMargin: 0
    }
}
