import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Window 2.2

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
                console.log('getTiles', JSON.stringify(messageObject.getTiles))
                GLCode.getTiles(messageObject.getTiles);
                GLCode.updateTileVisibility();
            }
        }
    }

    Item {
        id: parserPool
        property list<ParserWorkerScript> w: [
            ParserWorkerScript {},
            ParserWorkerScript {},
            ParserWorkerScript {},
            ParserWorkerScript {}
        ]
    }

    Compass {
        id: compass
    }

    Text {
        id: progress
        text: qsTr("loading")
    }

    Canvas {
        id: imageRenderer

        width: 512
        height: 512
    }

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
}
