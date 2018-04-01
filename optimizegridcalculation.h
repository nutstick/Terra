#ifndef OPTIMIZEGRIDCALCULATION_H
#define OPTIMIZEGRIDCALCULATION_H
#include "gridcalculation.h"

class OptimizeGridCalculation : public GridCalculation
{
    Q_OBJECT
public:
    explicit OptimizeGridCalculation(qreal maxDistancePerFlight, QObject *parent = nullptr);

    Q_INVOKABLE QList<QVariant> genGridInsideBound(QVariantList bound_, QVariant takeoffPoint_, float gridSpace, float gridAngle = 0);
private:
    int mMaxRegions;

    static double calculateArea(QList<QPointF> &polygon);

    static void sortPolygonPointOrder(QList<QPointF> &polygon, bool reverseOrder = false);
    static qreal linePointDist(QPointF A, QPointF B, QPointF C, bool isSegment);
    // static double calculateLength(QList<QPointF> &polygon);
    // static void GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double* x, double* y, double* z);
    // static void LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out);
    // static void polygonFromCoordinate(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> coordList, QList<QPointF> &polygonPoints);
    static void gridOptimizeGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace);
    static void gridGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace, float gridAngle);
    // static void intersectLinesWithPolygon(const QList<QLineF>& lineList, const QPolygonF& polygon, QList<QLineF>& resultLines);
    // static QPointF rotatePoint(const QPointF& point, const QPointF& origin, double angle);
    // static void adjustLineDirection(const QList<QLineF>& lineList, QList<QLineF>& resultLines);
};

#endif // OPTIMIZEGRIDCALCULATION_H
