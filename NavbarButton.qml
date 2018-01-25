import QtQuick 2.0

Rectangle {
    property alias text: label.text
    id: navbarButton
    Rectangle {
        height: 40
        anchors.right: parent.right
        anchors.rightMargin: 12
        anchors.left: parent.left
        anchors.leftMargin: 12
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 10
        anchors.top: parent.top
        anchors.topMargin: 6

        Text {
            id: label
            width: parent.width
            anchors.bottom: parent.bottom
            anchors.bottomMargin: 0
            font.bold: false
            font.capitalization: Font.MixedCase
            font.family: "Tahoma"
            fontSizeMode: Text.FixedSize
            horizontalAlignment: Text.AlignHCenter
        }
    }
}
