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

    property var map_

    function onMapChanged(map) {
        tabView.getTab(tabView.currentIndex).item.map = map;
        map_ = map
    }

    function onMapUpdate() {
        tabView.getTab(tabView.currentIndex).item.onUpdate();
    }

    TabView {
        id: tabView
        width: parent.width
        height: parent.height

        Tab {
            title: "Mission"

            component: MissionControlView {
                id: missionControlView
            }
        }
        Tab {
            title: "Map"

            component: MapControlView {
                id: mapControlView
            }

            onActiveChanged: {
                tabView.getTab(tabView.currentIndex).item.map = map_;
                tabView.getTab(tabView.currentIndex).item.map.currentMission.debug = { updated: false }
            }
        }
        Tab {
            title: "Green"
            Rectangle { color: "green" }
        }
    }
}
