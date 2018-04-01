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

    function onUpdate() {
        if (!map.currentMission.debug.updated) return;
        map.currentMission.debug.updated = false;

        listModel.clear();
        for (var i=0; i<map.currentMission.pins.length; i++) {
            var coord = map.currentMission.pins[i].coordinate;
            listModel.append({
                index: i+1,
                latitude: coord.latitude.toFixed(4)/1,
                longitude: coord.latitude.toFixed(4)/1,
                altitude: coord.altitude.toFixed(4)/1
            });
        }
    }

    onMapChanged: {
        onUpdate();
    }


    Text {
        id: header
        color: "#4029ff"
        text: "Mission Controller"
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
            id: missionText
            height: parent.height
            text: qsTr("Mission : ")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }

        ComboBox {
            id: missionComboBox
        }

    }

    Row {
        id: row1
        width: parent.width
        height: 200
        Column {
            id: column
            width: parent.width
            height: 400

            Text {
                id: pinsText
                x: 0
                height: 26
                text: qsTr("Pins : ")
                verticalAlignment: Text.AlignVCenter
                font.pixelSize: 12
            }

            ListView {
                id: listView
                x: 0
                width: parent.width
                height: 300

                Component {
                    id: pinDelegate
                    Row {
                        id: root
                        height: 26
                        spacing: 10
                        x: 5
                        width: parent.width

                        Text {
                            id: idText
                            height: 26
                            text: qsTr("#" + index + " : ")
                            verticalAlignment: Text.AlignVCenter
                            font.pixelSize: 12
                        }

                        TextEdit {
                            id: xTEdit
                            width: 80
                            height: 15
                            text: latitude
                            anchors.verticalCenter: parent.verticalCenter
                            font.wordSpacing: 0
                            font.pixelSize: 12
                        }

                        TextEdit {
                            id: yTEdit1
                            width: 80
                            height: 15
                            text: longitude
                            anchors.verticalCenter: parent.verticalCenter
                            font.pixelSize: 12
                        }

                        TextEdit {
                            id: yTEdit2
                            width: 80
                            height: 15
                            text: altitude
                            anchors.verticalCenter: parent.verticalCenter
                            font.pixelSize: 12
                        }


                    }
                }

                delegate: pinDelegate
                model: ListModel {
                    id: listModel
                }
            }
        }

        spacing: 0
    }

    Row {
        id: row3
        width: parent.width
        height: 78

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
                        gridLength = calculateLength(map.currentMission.grids);
                    }
                }

                Button {
                    id: optimize
                    x: 113
                    text: qsTr("Optimization")
                    onClicked: {
                        map.generateGrid('opt');
                        optimizeGridLength = calculateLength(map.currentMission.grids);
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

    Row {
        id: row2
        width: parent.width
        height: 26
        spacing: 0
        Text {
            id: testCaseText
            height: parent.height
            text: qsTr("Test Case : ")
            verticalAlignment: Text.AlignVCenter
            font.pixelSize: 12
        }

        ComboBox {
            id: testCaseComboBox
            model: [ "1", "2", "3", "4" ]
        }

        Button {
            id: testCaseSubmit
            text: qsTr("Submit")
            onClicked: {
                var pts = [];
                switch(testCaseComboBox.currentIndex) {
                case 0:
                    pts = [
                         QtPositioning.coordinate(13.738306772926723, 100.53068047568856, 10),
                         QtPositioning.coordinate(13.739013102055642, 100.53072382364125, 10),
                         QtPositioning.coordinate(13.738934237108017, 100.53124540615603, 10),
                         QtPositioning.coordinate(13.73829834824066, 100.53111367933914, 10)
                     ];
                    break;
                case 1:
                    pts = [
                        QtPositioning.coordinate(13.739226699020184, 100.5288314266761, 10),
                        QtPositioning.coordinate(13.739226699020184, 100.53015391473548, 10),
                        QtPositioning.coordinate(13.737942047273437, 100.53015391473548, 10),
                        QtPositioning.coordinate(13.737942047273437, 100.5288314266761, 10)
                    ];
                    break;
                case 2:
                    pts = [
                        QtPositioning.coordinate(13.73862045878767, 100.53050769416791, 10),
                        QtPositioning.coordinate(13.738515765839985, 100.53111432749557, 10),
                        QtPositioning.coordinate(13.739975004884439, 100.53111459254251, 10),
                        QtPositioning.coordinate(13.739849288327429, 100.53194307152324, 10),
                        QtPositioning.coordinate(13.737335807040923, 100.53183018222728, 10),
                        QtPositioning.coordinate(13.737335807040923, 100.53050769416791, 10)
                    ];
                    break;
                case 3:
                    pts = [
                        QtPositioning.coordinate(13.737194398888425, 100.5306670470161, 10),
                        QtPositioning.coordinate(13.737194398888425, 100.53198953507547, 10),
                        QtPositioning.coordinate(13.735909747141678, 100.53198953507547, 10),
                        QtPositioning.coordinate(13.735909747141678, 100.5306670470161, 10)
                    ]
                    break;
                }

                map.currentMission.clearPins();
                pts.forEach(function(pt) {
                    map.currentMission.addPin(pt);
                });
            }
        }
    }
}
