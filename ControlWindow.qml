import QtQuick 2.4
import QtQuick.Window 2.3
import QtQuick.Controls 1.4
import QtPositioning 5.8

Window {
    width: 300
    height: 550
    title: "Map controller"
    flags: Qt.Window
    visible: true

    function onMapChanged(map) {
        tabView.getTab(0).children[0].map = map;
    }

    function onMapUpdate() {
        tabView.getTab(0).children[0].onUpdate();
    }

    TabView {
        id: tabView
        width: parent.width
        height: parent.height


        Tab {
            title: "Map"

            MapControlView { id: mapControlView }
        }
        Tab {
            id: mapControlTab
            title: "Map1"

            Rectangle { color: "red" }
        }
        Tab {
            title: "Green"
            Rectangle { color: "green" }
        }
    }
}
