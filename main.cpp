#include <QApplication>
#include <QQuickView>
#include <QQmlContext>
#include <QQmlApplicationEngine>

#include <QtGui/QGuiApplication>
#include <QtGui/QScreen>
#include <QtQml/QQmlEngine>
#include <QtQml/QQmlComponent>
#include <QtQuick/QQuickWindow>
#include <QtCore/QUrl>
#include <QDebug>

#include "jstimer.h"
#include "gridcalculation.h"
#include "optimizegridcalculation.h"

int main(int argc, char *argv[])
{
#if defined(Q_OS_WIN)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif

    QApplication app(argc, argv);

    // app.setStyleSheet("Component#markersDelegate { border-bottom: 1px solid grey; }");

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
    /*
    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("timer", timer);
    engine.rootContext()->setContextProperty("gridcalculation", g);
    engine.rootContext()->setContextProperty("optimizeGridCalculation", opg);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
    */
}
