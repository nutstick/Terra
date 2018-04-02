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
    explicit GridCalculation(qreal speed, qreal minute, QObject *parent = nullptr);
    Q_INVOKABLE QVariantList genGridInsideBound(QVariantList bound_, QVariant takeoffPoint_, float gridSpace, float gridAngle);
    Q_INVOKABLE QList<QGeoCoordinate> genGridInsideBound(QList<QGeoCoordinate> bound, float gridSpace, float gridAngle);

    qreal speed() { return mSpeed; }
    void setSpeed(const qreal speed) {
        mSpeed = speed;
        mMaxDistancePerFlight = mSpeed * mMinute * 60;
    }

    qreal minute() { return mMinute; }
    void setMinute(const qreal minute) {
        mMinute = minute;
        mMaxDistancePerFlight = mSpeed * mMinute * 60;
    }
//    Q_INVOKABLE QList<QGeoCoordinate> genGridInsideBound(QList<QGeoCoordinate> bound, float gridSpace, float gridAngle);

protected:
    static qreal distanceFromPointToPoint(QPointF A, QPointF B);
    static double calculateLength(QList<QPointF> &polygon);
    static void GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double* x, double* y, double* z);
    static void LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out);

    static QList<QPointF> GeoListToLtpList(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> &coords) {
        QList<QPointF> points;
        for (int i=0; i<coords.count(); ++i) {
            double y, x, down;
            QGeoCoordinate pt = coords[i];
            GeoToLtp(pt, tangentOrigin, &y, &x, &down);
            points << QPointF(x, -y);
        }
        return points;
    }
    static QList<QGeoCoordinate> LtpListToGeoList(QGeoCoordinate tangentOrigin, QList<QPointF> points) {
        QList<QGeoCoordinate> coords;
        for (int i=0; i<points.count(); ++i) {
            QPointF& point = points[i];
            QGeoCoordinate geoCoord;
            LtpToGeo(-point.y(), point.x(), 0, tangentOrigin, &geoCoord);
            coords << geoCoord;
        }
        return coords;
    }

    static void gridGenerator(const QList<QPointF>& polygonPoints,  QList<QPointF>& gridPoints, float gridSpace, float gridAngle);
    static void intersectLinesWithPolygon(const QList<QLineF>& lineList, const QPolygonF& polygon, QList<QLineF>& resultLines);
    static QPointF rotatePoint(const QPointF& point, const QPointF& origin, double angle);
    static void adjustLineDirection(const QList<QLineF>& lineList, QList<QLineF>& resultLines);

    qreal mSpeed;
    qreal mMinute;
    qreal mMaxDistancePerFlight;
};

#endif // GRIDCALCULATION_H
