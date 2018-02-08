import QtQuick 2.7
import QtCanvas3D 1.1
import QtQuick.Window 2.2
import QtQuick.Scene3D 2.0

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

    Text {
        id: progress

        text: qsTr("loading")
    }
}
