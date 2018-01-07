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
            console.log(messageObject)
            var queue = messageObject.getTiles[0].length;

            if (queue > 0) {
                Map.getTiles(messageObject.getTiles);
                Map.updateTileVisibility();
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

    Canvas3D {
        id: canvas3d

        property int parserRequest: 0

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
