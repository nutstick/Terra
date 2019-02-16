#include <QApplication>
#include <QQuickView>
#include <QQmlContext>
#include <QOpenGLContext>
// #include <QQmlApplicationEngine>

#include <QtGui/QGuiApplication>
#include <QtGui/QScreen>
#include <QtQml/QQmlEngine>
#include <QtQml/QQmlComponent>
#include <QtQuick/QQuickWindow>
#include <QtCore/QUrl>
#include <QDebug>

#include "jstimer.h"
<<<<<<< HEAD
#include "cameracontroller.h"
#include "mycamera.h"
#include "map.h"
#include "entity.h"
#include "markerentity.h"
#include "tile.h"

#include "sphericalmercator.h"
=======
#include "gridcalculation.h"
#include "optimizegridcalculation.h"
>>>>>>> ThreeJS

int main(int argc, char *argv[])
{
    qmlRegisterType<CameraController>("com.terra", 1, 0, "CameraController");
    qmlRegisterType<MyCamera>("com.terra", 1, 0, "MyCamera");
    qmlRegisterType<Map>("com.terra", 1, 0, "Map");
    qmlRegisterType<Entity>("com.terra", 1, 0, "MyEntity");
    qmlRegisterType<MarkerEntity>("com.terra", 1, 0, "Marker");

#if defined(Q_OS_WIN)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif
    qDebug() << SphericalMercator::instance()->geoCoordinateToScreenPx(QGeoCoordinate(13.7383777, 100.5320528, 9), 0);

    QApplication app(argc, argv);

    // app.setStyleSheet("Component#markersDelegate { border-bottom: 1px solid grey; }");

<<<<<<< HEAD
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
=======
    JSTimer* timer = new JSTimer();
    GridCalculation* g = new GridCalculation(5, 10);
    OptimizeGridCalculation* opg = new OptimizeGridCalculation(5, 10);

    const auto screens = QGuiApplication::screens();
    for (QScreen *screen : screens)
        screen->setOrientationUpdateMask(Qt::LandscapeOrientation | Qt::PortraitOrientation |
                                         Qt::InvertedLandscapeOrientation | Qt::InvertedPortraitOrientation);
    QQmlEngine engine;
    engine.rootContext()->setContextProperty("timer", timer);
    engine.rootContext()->setContextProperty("gridcalculation", g);
    engine.rootContext()->setContextProperty("optimizeGridCalculation", opg);
    QQmlComponent component(&engine);
    QQuickWindow::setDefaultAlphaBuffer(true);
    component.loadUrl(QUrl("qrc:/main.qml"));
    if ( component.isReady() )
        component.create();
    else
        qWarning() << component.errorString();
    return app.exec();
>>>>>>> ThreeJS
    /*
    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("timer", timer);
    engine.rootContext()->setContextProperty("gridcalculation", g);
    engine.rootContext()->setContextProperty("optimizeGridCalculation", opg);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    if (engine.rootObjects().isEmpty())
        return -1;
    */

    return app.exec();
    */
}
