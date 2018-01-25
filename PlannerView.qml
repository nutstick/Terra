import QtQuick 2.0
import QtQuick.Window 2.2

Column {
    id: plannerView
    // height: 480
    spacing: 0

    states: [
        State {
            name: "pin"
        },
        State {
            name: "mission"
        }
    ]

    Rectangle {
        width: parent.width
        height: 56
        Row {
            id: header
            height: parent.height
            anchors.horizontalCenter: parent.horizontalCenter
            transformOrigin: Item.Center

            NavbarButton {
                id: pinButton
                width: Math.max(header.width / 2, 168)
                height: header.height
                text: qsTr("Pins")
            }

            NavbarButton {
                id: missionButton
                width: Math.max(header.width / 2, 168)
                height: header.height
                text: qsTr("Missions")
            }
        }
    }

    Rectangle {
        width: parent.width
        height: parent.height - 56
        ListView {
            id: listView
            width: parent.width
            height: parent.height

            model: MarkerModel {
                id: markerList
            }
            delegate: Component {
                id: markersDelegate
                Rectangle {
                    id: wrapper
                    height: 36
                    Text {
                        id: contactInfo
                        text: name + ": " + number
                    }
                }
            }
        }
    }
}
