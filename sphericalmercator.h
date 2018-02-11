#ifndef SPHERICALMERCATOR_H
#define SPHERICALMERCATOR_H

#include <QtGlobal>
#include <QScopedPointer>
#include "call_once.h"
#include <QGeoCoordinate>

class QVector2D;

class SphericalMercator
{
private:
    SphericalMercator();

    static SphericalMercator* createInstance();

public:
    ~SphericalMercator();
    static SphericalMercator* instance();

    QPointF geoCoordinateToScreenPx(QGeoCoordinate coord, int zoom);
    QGeoCoordinate screenPxToLGeoCoordinate(QPointF pixel, int zoom);

    double size = 650240;

private:
    QVector<double> Ac, Bc, Cc, zc;
};

#endif // SPHERICALMERCATOR_H
