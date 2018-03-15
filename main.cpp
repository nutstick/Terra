#include <QApplication>
#include <QQuickView>
#include <QQmlContext>
#include <QQmlApplicationEngine>

#include <QVariantList>

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
    GridCalculation* g = new GridCalculation(5/*m*/ * 10/*min*/ * 60);
    OptimizeGridCalculation* opg = new OptimizeGridCalculation(5/*m*/ * 10/*min*/ * 60);

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("timer", timer);
    engine.rootContext()->setContextProperty("gridcalculation", g);
    engine.rootContext()->setContextProperty("optimizeGridCalculation", opg);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
}
