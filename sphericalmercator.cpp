#include "sphericalmercator.h"

#include <QVector2D>
#include <QtMath>
#include "singleton.h"

double EPSLN = 1.0e-10;
double D2R = M_PI / 180;
double R2D = 180 / M_PI;
double A = 6378137;
double MAXEXTENT = 20037508.342789244;

SphericalMercator::SphericalMercator() {
    double size_ = size;

    for (int i = 0; i < 30; ++i) {
        Bc.append(size_ / 360.0);
        Cc.append(size_ / (2.0 * M_PI));
        zc.append(size_ / 2.0);
        Ac.append(size_);
        size_ *= 2.0;
    }
}

SphericalMercator* SphericalMercator::createInstance()
{
    return new SphericalMercator();
}

SphericalMercator::~SphericalMercator()
{
}

SphericalMercator* SphericalMercator::instance()
{
    // Singleton<SphericalMercator>::instance(SphericalMercator::createInstance);
    return createInstance();
}

QPointF SphericalMercator::geoCoordinateToScreenPx(QGeoCoordinate coord, int zoom)
{
    double d = this.zc[zoom];
    double f = qMin(qMax(qSin(D2R * coord.latitude()), -0.9999), 0.9999);
    double x = (d + coord.longitude() * this->Bc[zoom]);
    double y = (d + 0.5 * qLn((1 + f) / (1 - f)) * (-this->Cc[zoom]));
    if (x > this->Ac[zoom]) x = this->Ac[zoom];
    if (y > this->Ac[zoom]) y = this->Ac[zoom];

    return QPointF(x, y);
}

QGeoCoordinate SphericalMercator::screenPxToLGeoCoordinate(QPointF pixel, int zoom)
{
    double g = (pixel.y() - this->zc.at(zoom)) / -this->Cc.at(zoom);
    double lon = (pixel.x() - this->zc.at(zoom)) / this->Bc.at(zoom);
    double lat = R2D * (2.0 * qAtan(qExp(g)) - 0.5 * M_PI);

    return QGeoCoordinate(lon, lat);
}
