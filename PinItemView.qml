import QtQuick 2.0
import QtPositioning 5.9

Row {
    id: root
    height: 26
    spacing: 10

    property int index: -1

    onIndexChanged: {
        idText.text = qsTr("#" + index + " : ")
    }

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
        height: 26
        text: qsTr("Text Edit")
        font.pixelSize: 12
    }

    TextEdit {
        id: yTEdit1
        width: 80
        height: 26
        text: qsTr("Text Edit")
        font.pixelSize: 12
    }

    TextEdit {
        id: yTEdit2
        width: 80
        height: 26
        text: qsTr("Text Edit")
        font.pixelSize: 12
    }


}
