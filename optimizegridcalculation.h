#ifndef OPTIMIZEGRIDCALCULATION_H
#define OPTIMIZEGRIDCALCULATION_H
#include <QGeoCoordinate>
#include <QtCore>
#include <QPolygonF>

#define DEG_TO_RAD (M_PI / 180.0)
#define RAD_TO_DEG (180.0 / M_PI)

#define G_VALUE					9.80665
#define AIR_DENS_SEALV15C		1.225f
#define GAS_CONS				287.1f
#define ABS_ZERO_CELSIUS		-273.15f
#define EARTH_RAD               6371000
static const float eps = std::numeric_limits<double>::epsilon();

class OptimizeGridCalculation : public QObject
{
    Q_OBJECT
public:
    explicit OptimizeGridCalculation(QObject *parent = nullptr);

    Q_INVOKABLE QVariantList genGridInsideBound(QVariantList bound_, float gridSpace, float gridAngle);
private:
    static double calculateArea(QList<QPointF> &polygon);
    static void GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double* x, double* y, double* z);
    static void LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out);
    static void polygonFromCoordinate(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> coordList, QList<QPointF> &polygonPoints);
};

#endif // OPTIMIZEGRIDCALCULATION_H
