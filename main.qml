import QtQuick 2.7
import QtCanvas3D 1.1
import QtQuick.Controls 1.4
import QtQuick.Window 2.2
import QtQuick.Scene3D 2.0
import QtPositioning 5.2

import "glcode.js" as GLCode

Item {
    id: root
    width: 640
    height: 360
    visible: true

    Compass {
        id: compass
    }

    Scene3D {
        anchors.fill: parent
        aspects: ["render", "logic", "input"]

        SceneRoot {
            id: sceneRoot
        }

    }

    Button {
        id: setView
        text: "set view"
        onClicked: {
            sceneRoot.map.setView(QtPositioning.coordinate(13.7419073, 100.5279612, 11))
        }
    }

    Text {
        id: progress

        text: qsTr("loading")
    }
}
