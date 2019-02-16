#include "jstimer.h"

#include <QDebug>

#include <QTimerEvent>

JSTimer::JSTimer(QObject *parent) : QObject(parent)
{

}

/**
 * @brief Calls a JS function after a specified delay.
 * @param callback JS function
 * @param delay
 * @return
 */
int JSTimer::setTimeout(QJSValue callback, int delay)
{
    if(delay < 0) {
        delay = 0;
    }

    int timerId = startTimer(delay, Qt::PreciseTimer);
    m_setTimeoutCallbacks.insert(timerId, callback);

    return timerId;
}

/**
 * @brief Clears delayed function or code snippet set by setTimeout
 * @param timeoutId
 * @return
 */
void JSTimer::clearTimeout(int timeoutId)
{
    if(m_setTimeoutCallbacks.contains(timeoutId)) {
        m_setTimeoutCallbacks.remove(timeoutId);
        killTimer(timeoutId);
    }
}

/**
 * @brief Calls a JS function with a specified interval.
 * @param callback JS function
 * @param delay
 * @return
 */
int JSTimer::setInterval(QJSValue callback, int interval)
{
    if(interval < 0) {
        interval = 0;
    }

    int timerId = startTimer((interval < 0), Qt::PreciseTimer);
    m_setIntervalCallbacks.insert(timerId, callback);

    return timerId;
}


/**
 * @brief Clears interval function or code snippet set by setInterval
 * @param timeoutId
 * @return
 */
void JSTimer::clearInterval(int intervalId)
{
    if(m_setIntervalCallbacks.contains(intervalId)) {
        m_setIntervalCallbacks.remove(intervalId);
        killTimer(intervalId);
    }
}

void JSTimer::timerEvent(QTimerEvent *event) {
    QJSValue callback;
    if(m_setTimeoutCallbacks.contains(event->timerId())) {
        callback = m_setTimeoutCallbacks[event->timerId()];
        m_setTimeoutCallbacks.remove(event->timerId());
        killTimer(event->timerId());
        event->accept();
    } else if(m_setIntervalCallbacks.contains(event->timerId())) {
        callback = m_setIntervalCallbacks[event->timerId()];
        event->accept();
    }

    if(!callback.isUndefined()) {
        if(callback.isCallable()) {
            callback.call();
        } else { // if isn't a function callback is treated as snippet of code
            // m_scriptEngine->evaluate(callback.toString());
        }
    }
}
