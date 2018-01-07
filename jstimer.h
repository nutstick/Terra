#ifndef JSTIMER_H
#define JSTIMER_H

#include <QObject>
#include <QHash>
#include <QJSValue>

class JSTimer : public QObject
{
    Q_OBJECT
public:
    explicit JSTimer(QObject *parent = nullptr);

    Q_INVOKABLE int setTimeout(QJSValue callback = QJSValue(), int delay = 0);
    Q_INVOKABLE void clearTimeout(int timeoutId = 0);
    Q_INVOKABLE int setInterval(QJSValue callback = QJSValue(), int interval = 0);
    Q_INVOKABLE void clearInterval(int intervalId = 0);

signals:

public slots:

protected:
    QHash<int, QJSValue> m_setTimeoutCallbacks;
    QHash<int, QJSValue> m_setIntervalCallbacks;

     void timerEvent(QTimerEvent *event);
};

#endif // JSTIMER_H
