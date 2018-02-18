#ifndef GRIDCALCULATION_H
#define GRIDCALCULATION_H
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

class GridCalculation : public QObject
{
    Q_OBJECT
public:
    explicit GridCalculation(QObject *parent = nullptr);
    Q_INVOKABLE QList<QGeoCoordinate> genGridInsideBound(QVariantList bound_, float gridSpace, float gridAngle);
//    Q_INVOKABLE QList<QGeoCoordinate> genGridInsideBound(QList<QGeoCoordinate> bound, float gridSpace, float gridAngle);

private:
    static void GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double* x, double* y, double* z);
    static void LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out);
    static void polygonFromCoordinate(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> coordList, QList<QPointF> &polygonPoints);
    static void gridGenerator(const QList<QPointF>& polygonPoints,  QList<QPointF>& gridPoints, float gridSpace, float gridAngle);
    static void intersectLinesWithPolygon(const QList<QLineF>& lineList, const QPolygonF& polygon, QList<QLineF>& resultLines);
    static QPointF rotatePoint(const QPointF& point, const QPointF& origin, double angle);
    static void adjustLineDirection(const QList<QLineF>& lineList, QList<QLineF>& resultLines);
};

#endif // GRIDCALCULATION_H
