#include <QApplication>
#include <QQuickView>
#include <QQmlContext>
#include <QQmlApplicationEngine>

#include "jstimer.h"

int main(int argc, char *argv[])
{
#if defined(Q_OS_WIN)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif

    QApplication app(argc, argv);

    app.setStyleSheet("Component#markersDelegate { border-bottom: 1px solid grey; }");

    JSTimer timer;

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("timer", &timer);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
}
