import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Extras 2.0

RenderSettings {
    id: root

    property alias camera: renderer.camera

    activeFrameGraph: ForwardRenderer {
        id: renderer
        clearColor: Qt.rgba(0, 0.5, 1, 1)
    }

}
