#ifndef SPHERICALMERCATOR_H
#define SPHERICALMERCATOR_H

#include <QtGlobal>
#include <QScopedPointer>
#include "call_once.h"
#include <QVector>
#include <QGeoCoordinate>

class QVector2D;

class SphericalMercator
{
private:
    SphericalMercator(float size = 256);

    static SphericalMercator* createInstance();

public:
    ~SphericalMercator();
    static SphericalMercator* instance();

    QVector3D geoCoordinateToWorldSpace(QGeoCoordinate coord);
    QGeoCoordinate worldSpaceTogeoCoordinate(QVector3D coord);
    QPointF geoCoordinateToScreenPx(QGeoCoordinate coord, int zoom);
    QGeoCoordinate screenPxToLGeoCoordinate(QPointF pixel, int zoom);

    double size = 650240;

private:
    QVector<double> Ac, Bc, Cc, zc;
};

#endif // SPHERICALMERCATOR_H
