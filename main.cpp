#include <QGuiApplication>
#include <QQuickView>
#include <QQmlContext>
#include <QOpenGLContext>
// #include <QQmlApplicationEngine>

#include "jstimer.h"
#include "cameracontroller.h"
#include "mycamera.h"
#include "map.h"
#include "markerentity.h"

int main(int argc, char *argv[])
{
    qmlRegisterType<CameraController>("com.terra.cameracontroller", 1, 0, "CameraController");
    qmlRegisterType<MyCamera>("com.terra.camera", 1, 0, "MyCamera");
    qmlRegisterType<Map>("com.terra.map", 1, 0, "Map");
    qmlRegisterType<MarkerEntity>("com.terra.map", 1, 0, "Marker");

#if defined(Q_OS_WIN)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif

    QGuiApplication app(argc, argv);

    QSurfaceFormat format;
    if (QOpenGLContext::openGLModuleType() == QOpenGLContext::LibGL) {
        format.setVersion(3, 2);
        format.setProfile(QSurfaceFormat::CoreProfile);
    }
    format.setDepthBufferSize(24);
    format.setStencilBufferSize(8);
    format.setSamples(4);


    JSTimer timer;

    QQuickView view;
    view.setFormat(format);
    view.rootContext()->setContextProperty("timer", &timer);
    view.setResizeMode(QQuickView::SizeRootObjectToView);
    view.setSource(QUrl("qrc:/main.qml"));
    view.setColor("#000000");
    view.show();
    /*
    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("timer", &timer);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    if (engine.rootObjects().isEmpty())
        return -1;
    */

    return app.exec();
}
