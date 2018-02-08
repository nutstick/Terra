import Qt3D.Core 2.0
import Qt3D.Render 2.0
import Qt3D.Extras 2.0

TechniqueFilter {
    id: root

    // Expose camera to allow user to choose which camera to use for rendering
    property alias camera: cameraSelector.camera
//    property alias window: surfaceSelector.surface

    // Expose the layers we'll manage during rendering
    readonly property Layer mapLayer: Layer { recursive: true }
    readonly property Layer entityLayer: Layer { recursive: true }

    matchAll: [ FilterKey { name: "renderingStyle"; value: "forward" } ]

    RenderSurfaceSelector {
        Viewport {
            id: viewport
            normalizedRect: Qt.rect(0.0, 0.0, 1.0, 1.0)

            ClearBuffers {
                buffers: ClearBuffers.ColorDepthBuffer

                CameraSelector {
                    id: cameraSelector
                }
            }
        }
    }
}
