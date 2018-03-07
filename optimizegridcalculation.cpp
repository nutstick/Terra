#include "optimizegridcalculation.h"

qreal dot(QPointF A, QPointF B, QPointF C)
{
    QPointF AB = QPointF;
    QPointF BC = QPointF;
    AB.setX(B.x()-A.x());
    AB.setY(B.y()-A.y());
    BC.setX(C.x()-B.x());
    BC.setY(C.y()-B.y());
    qreal dot = AB.x() * BC.x() + AB.y() * BC.y();
    return dot;
}

//Compute the cross product AB x AC
qreal cross(QPointF A, QPointF B, QPointF C)
{
    QPointF AB = QPointF;
    QPointF AC = QPointF;
    AB.setX(B.x()-A.x());
    AB.setY(B.y()-A.y());
    AC.setX(C.x()-A.x());
    AC.setY(C.y()-A.y());
    qreal cross = AB.x() * AC.y() - AB.y() * AC.x();
    return cross;
}

qreal linePointDist(QPointF A, QPointF B, QPointF C, bool isSegment)
{
    qreal dist = cross(A,B,C) / distance(A,B);
    if(isSegment){
        //int dot1 = dot(A,B,C);
        //if(dot1 > 0)return distance(B,C);
        int dot2 = dot(B,A,C);
        if(dot2 > 0)return distance(A,C);
    }
    return abs(dist);
}

QPointF projectPointToLine(QPointF A, QPointF B, QPointF C, bool isSegment)
{
    if(isSegment){
        // int dot1 = dot(A,B,C);
        // if(dot1 > 0) return B;
        int dot2 = dot(B,A,C);
        if(dot2 > 0) return A;
    }
    QPointF AC = C - A;
    QPointF AB = B - A;
    QPointF result = A + QPointF::dotProduct(AC, AB) / QPointF::dotProduct(AB, AB) * AB;
    return result;
}

OptimizeGridCalculation::OptimizeGridCalculation(QObject *parent)
    : QObject(parent)
{
}

QVariantList OptimizeGridCalculation::genGridInsideBound(QVariantList bound_, float gridSpace, QVariant startPoint_)
{
    QList<QGeoCoordinate> bound;
    // Parsing JS value to C++
    QPointF startPoint;
    for (const QVariant point : bound_) {
        bound.append(point.value<QGeoCoordinate>());
    }
    startPoint = startPoint_.value<QGeoCoordinate>();

    QList<QPointF> polygonPoints;
    QList<QPointF> sortedPolygonPoints;
    QList<QPointF> gridPoints;
    QList<QPointF> interimPoints;
    QList<QGeoCoordinate> returnValue;
    QList<double> percentPoint;

    // Convert polygon to Qt coordinate system (y positive is down)
    if(bound.count() <= 2) {
        QList<QVariant> output;
        foreach (QGeoCoordinate coor, returnValue) {
            output.append(QVariant::fromValue(coor));
        }
        return output;
    }

    QGeoCoordinate tangentOrigin = bound[0];
    polygonFromCoordinate(tangentOrigin, bound, polygonPoints);

    double coveredArea = calculateArea(polygonPoints);

    // Caculate minimum distance from start point to polygon
    qreal nearestDistance = INFINITY;
    int nearestLine;
    for (int i=0; i<polygonPoints.count(); i++) {
        qreal dist;
        if (i == 0) {
            dist = linePointDist(polygonPoints.last(), polygonPoints[i], startPoint, true);
        } else {
            dist = linePointDist(polygonPoints[i-1], polygonPoints[i], startPoint, true);
        }

        if (nearestDistance > dist) {
            nearestDistance = dist;
            nearestLine = i == 0 ? polygonPoints.count()-1 : i-1;
        }
    }
    // project start point to nearest line
    QPointF newStartPoint = projectPointToLine(polygonPoints[nearestLine], polygonPoints[nearestLine+1], startPoint, true);

    // Add new start point to polygon
    if (newStartPoint != polygonPoints[nearestLine]) {
        sortedPolygonPoints.append(newStartPoint);
        nearestLine = (nearestLine + 1) % polygonPoints.count();
    }
    // Rearrange the order
    int i = nearestLine;
    do {
        sortedPolygonPoints.append(polygonPoints[i]);
        i = (i + 1) % polygonPoints.count();
    } while(i != nearestLine);

    polygonPoints = sortedPolygonPoints;

    // Point length percent calculate
    qreal dist;
    percentPoint.append(0.0);
    for (int i=1; i<=polygonPoints.count(); i++) {
        if (i == polygonPoints.count()) {
            dist += distance(polygonPoints[i-1], polygonPoints.first());
        } else {
            dist += distance(polygonPoints[i-1], polygonPoints[i]);
        }
        percentPoint.append(dist);
    }

    for (int parts = 1; parts <= 5; parts++) {
        double area = coveredArea / parts;
        QList<QPointF> seperatePoints;

        qreal referenceDistance = percentPoint[1];
        QPointF referencePoint = polygonPoints[1];
        int lowerindex = qLowerBound(percentPoint.begin(), percentPoint.end(), referenceDistance);

        for (int p = 0; p < parts; p++) {
            double start = referenceDistance, end = dist, mid;
            QPointF midPoint;

            while(start - end >= eps) {
                mid = (start + end) / 2.0;
                midPoint = distanceToPoint(polygonPoints, percentPoint, mid);
                int upperindex = qUpperBound(percentPoint.begin(), percentPoint.end(), mid);

                // Create polygon
                QList<QPointF> a;
                a << referencePoint;
                for (int i=lowerindex;i<=upperindex;i++) {
                    a << polygonPoints[i];
                }
                a << midPoint;

                qreal calcArea = calculateArea(a);

                // Binary search
                if (calcArea < area) {
                    start = mid;
                } else if (calcArea > area) {
                    end = mid;
                } else {
                    break;
                }
            }

            seperatePoints << midPoint;
            referenceDistance = mid;
            referencePoint = midPoint;
        }
    }
}

double OptimizeGridCalculation::calculateLength(QList<QPointF> &polygon)
{
    double length = 0.0;
    for (int i=0; i<polygon.count(); i++) {
        if (i != 0) {
            length += qSqrt((polygon[i+1].x() - polygon[i].x()) * (polygon[i+1].x() - polygon[i].x()) + (polygon[i-1].y() - polygon[i].y()) * (polygon[i+11].y() - polygon[i].y()));
        } else {
            length += qSqrt((polygon.first().x() - polygon[i].x()) * (polygon.first().x() - polygon[i].x()) + (polygon.first().y() - polygon[i].y()) * (polygon.first().y() - polygon[i].y()));
        }
    }
    return length;
}

double OptimizeGridCalculation::calculateArea(QList<QPointF> &polygon)
{
    double coveredArea = 0.0;
    for (int i=0; i<polygon.count(); i++) {
        if (i != 0) {
            coveredArea += polygon[i - 1].x() * polygon[i].y() - polygon[i].x() * polygon[i -1].y();
        } else {
            coveredArea += polygon.last().x() * polygon[i].y() - polygon[i].x() * polygon.last().y();
        }
    }
    return coveredArea;
}

void OptimizeGridCalculation::GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double *x, double *y, double *z)
{
    double lat_rad = in.latitude() * DEG_TO_RAD;
    double lon_rad = in.longitude() * DEG_TO_RAD;

    double ref_lon_rad = ref.longitude() * DEG_TO_RAD;
    double ref_lat_rad = ref.latitude() * DEG_TO_RAD;

    double sin_lat = sin(lat_rad);
    double cos_lat = cos(lat_rad);
    double cos_d_lon = cos(lon_rad - ref_lon_rad);

    double ref_sin_lat = sin(ref_lat_rad);
    double ref_cos_lat = cos(ref_lat_rad);

    double c = acos(ref_sin_lat * sin_lat + ref_cos_lat * cos_lat * cos_d_lon);
    double k = (fabs(c) < eps) ? 1.0 : (c / sin(c));

    *x = k * (ref_cos_lat * sin_lat - ref_sin_lat * cos_lat * cos_d_lon) * EARTH_RAD;
    *y = k * cos_lat * sin(lon_rad - ref_lon_rad) * EARTH_RAD;

    *z = -(in.altitude() - ref.altitude());

}

void OptimizeGridCalculation::LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out)
{
    double x_rad = x / EARTH_RAD;
    double y_rad = y / EARTH_RAD;
    double c = sqrtf(x_rad * x_rad + y_rad * y_rad);
    double sin_c = sin(c);
    double cos_c = cos(c);

    double ref_lon_rad = ref.longitude() * DEG_TO_RAD;
    double ref_lat_rad = ref.latitude() * DEG_TO_RAD;

    double ref_sin_lat = sin(ref_lat_rad);
    double ref_cos_lat = cos(ref_lat_rad);

    double lat_rad;
    double lon_rad;

    if (fabs(c) > eps) {
        lat_rad = asin(cos_c * ref_sin_lat + (x_rad * sin_c * ref_cos_lat) / c);
        lon_rad = (ref_lon_rad + atan2(y_rad * sin_c, c * ref_cos_lat * cos_c - x_rad * ref_sin_lat * sin_c));

    } else {
        lat_rad = ref_lat_rad;
        lon_rad = ref_lon_rad;
    }

    out->setLatitude(lat_rad * RAD_TO_DEG);
    out->setLongitude(lon_rad * RAD_TO_DEG);

    out->setAltitude(-z + ref.altitude());
}

void OptimizeGridCalculation::polygonFromCoordinate(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> coordList, QList<QPointF> &polygonPoints)
{
    polygonPoints.clear();
    polygonPoints += QPointF(0, 0);

    for (int i=1; i< coordList.count(); i++) {
        double y, x, down;
        auto pt = coordList[i];
        GeoToLtp(pt, tangentOrigin, &y, &x, &down);
        polygonPoints += QPointF(x, -y);
    }
}
