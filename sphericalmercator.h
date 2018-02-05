#ifndef SPHERICALMERCATOR_H
#define SPHERICALMERCATOR_H

#include <QtGlobal>
#include <QScopedPointer>
#include "call_once.h"
#include <QVector>

class QVector2D;

class SphericalMercator
{
private:
    SphericalMercator();

    static SphericalMercator* createInstance();

public:
    ~SphericalMercator();
    static SphericalMercator* instance();

    QVector2D screenPxToLonLat(QVector2D pixel, int zoom);

    float size = 650240;

private:
    QVector<float> Ac, Bc, Cc, zc;
};

#endif // SPHERICALMERCATOR_H
