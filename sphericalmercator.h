#ifndef SPHERICALMERCATOR_H
#define SPHERICALMERCATOR_H

class QVector2D;

class SphericalMercator
{
public:
    static QVector2D screenPxToLonLat(QVector2D pixel, float zoom);
};

#endif // SPHERICALMERCATOR_H
