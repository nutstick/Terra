#include "sphericalmercator.h"

#include <QVector2D>
#include <QtMath>
#include "singleton.h"

double EPSLN = 1.0e-10;
float D2R = M_PI / 180;
float R2D = 180 / M_PI;
float A = 6378137;
float MAXEXTENT = 20037508.342789244;

SphericalMercator::SphericalMercator() {
    float size_ = size;

    for (int i = 0; i < 30; ++i) {
        Bc.append(size_ / 360.0f);
        Cc.append(size_ / (2.0f * M_PI));
        zc.append(size_ / 2.0f);
        Ac.append(size_);
        size_ *= 2.0f;
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

QVector2D SphericalMercator::screenPxToLonLat(QVector2D pixel, int zoom)
{
    float g = (pixel.y() - this->zc.at(zoom)) / -this->Cc.at(zoom);
    float lon = (pixel.x() - this->zc.at(zoom)) / this->Bc.at(zoom);
    float lat = R2D * (2.0f * qAtan(qExp(g)) - 0.5f * M_PI);

    return QVector2D(lon, lat);
}
