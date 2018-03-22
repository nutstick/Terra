import QtQuick 2.4
import QtQuick.Window 2.3
import QtQuick.Controls 1.4
import QtPositioning 5.8

Column {
    x: 8
    y: 8
    width: 284
    height: 534
    spacing: 5

    property var map

    function vector3toString(x) {
        return 'x: ' + x.x + ', y: ' + x.y + ', z: ' + x.z;
    }
    function onUpdate() {
        camreaPositionContent.text = vector3toString(map.camera.position)
        camreaTargetContent.text = vector3toString(map.cameraController.target)
    }

    onMapChanged: {
        onUpdate();
    }


    Text {
        id: header
        color: "#4029ff"
        text: "Map controller"
        font.bold: true
        verticalAlignment: Text.AlignVCenter
        font.pixelSize: 16
    }

    Row {
        id: row
        width: parent.width
        height: 26
        spacing: 0

        Text {
            id: camreaPositionText
            height: parent.height
            text: qsTr("Camera Position : ")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }

        Text {
            id: camreaPositionContent
            height: parent.height
            text: qsTr("Text")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }
    }

    Row {
        id: row1
        width: parent.width
        height: 26
        Text {
            id: camreaTargetText
            height: parent.height
            text: qsTr("Camera Target : ")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }

        Text {
            id: camreaTargetContent
            height: parent.height
            text: qsTr("Text")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }
        spacing: 0
    }

    Row {
        id: row2
        width: parent.width
        height: 26
        Text {
            id: setViewText
            height: 26
            text: qsTr("Set View : ")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }

        Button {
            id: cu
            text: qsTr("Chula")
            onClicked: {
                map.setView(QtPositioning.coordinate(13.738521, 100.530987), 19);
            }
        }

        Button {
            id: world
            text: qsTr("World")
        }
        spacing: 0
    }

    Row {
        id: row3
        width: parent.width
        height: 26

        Column {
            id: column1
            width: parent.width
            height: 250


            Row {
                id: row4
                width: parent.width
                height: 26

                Text {
                    id: gridText
                    y: 0
                    height: 26
                    text: qsTr("Grid : ")
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }

                Button {
                    id: normal
                    text: qsTr("Normal")
                    onClicked: {
                      map.generateGrid('normal');
                    }
                }

                Button {
                    id: optimize
                    x: 113
                    text: qsTr("Optimization")
                    onClicked: {
                      map.generateGrid('opt');
                    }
                }
            }

            Row {
                id: row5
                x: 5
                y: 31
                width: parent.width - 10
                height: 26
                Text {
                    id: normalLength
                    height: parent.height
                    text: qsTr("Normal (gs):")
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }

                Text {
                    id: content2
                    height: parent.height
                    text: qsTr("Text")
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }
                spacing: 0
            }

            Row {
                id: row6
                x: 5
                width: parent.width - 10
                height: 26
                Text {
                    id: normalLength1
                    height: parent.height
                    text: qsTr("Optimize (gs):")
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }

                Text {
                    id: content3
                    height: parent.height
                    text: qsTr("Text")
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 12
                }
                spacing: 0
            }
        }
        spacing: 0
    }
}
