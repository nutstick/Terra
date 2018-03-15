#include "gridcalculation.h"
#include <QVariant>
#include <QVariantList>

qreal GridCalculation::distanceFromPointToPoint(QPointF A, QPointF B)
{
    return qSqrt((A.x() - B.x()) * (A.x() - B.x()) + (A.y() - B.y()) * (A.y() - B.y()));
}

GridCalculation::GridCalculation(qreal maxDistancePerFlight, QObject *parent)
    : QObject(parent)
    , mMaxDistancePerFlight(maxDistancePerFlight)
{
}

QVariantList GridCalculation::genGridInsideBound(QVariantList bound_, QVariant takeoffPoint_, float gridSpace, float gridAngle)
{
    // Convert varinat list to GeoCoordinate list
    QList<QGeoCoordinate> bound;
    for (const QVariant point : bound_) {
        bound.append(point.value<QGeoCoordinate>());
    }
    // Convert takeoff point
    QGeoCoordinate tangentOrigin = takeoffPoint_.value<QGeoCoordinate>();
    QPoint takeoffPoint(0.0, 0.0);

    QList<QPointF> gridPoints;
    QList<QPointF> interimPoints;

    // If least than 2 point in line return empty list
    if(bound.count() <= 2) {
        QList<QVariant> output;
        // TODO: Throw error
        return output;
    }

    // Convert polygon to Qt coordinate system (y positive is down)
    QList<QPointF> polygonPoints = GeoListToLtpList(tangentOrigin, bound);

    // Calculate covered area
    double coveredArea = 0.0;
    for (int i=0; i<polygonPoints.count(); i++) {
        if (i != 0) {
            coveredArea += polygonPoints[i - 1].x() * polygonPoints[i].y() - polygonPoints[i].x() * polygonPoints[i -1].y();
        } else {
            coveredArea += polygonPoints.last().x() * polygonPoints[i].y() - polygonPoints[i].x() * polygonPoints.last().y();
        }
    }

    // Generate grid
    gridGenerator(polygonPoints, gridPoints, gridSpace, gridAngle);

    qDebug() << gridPoints;

    // Sperate grid to Array<grid> by maxDistancePerFlight
    QList<QList<QGeoCoordinate>> returnValue;
    
    QList<QPointF> flight;
    // Next start point in case last reachable point not in polygon vertex
    bool haveNextStartPoint = false;
    QPointF nextStartPoint;
    // Start new flight with takeoff point
    flight << takeoffPoint;

    qreal distance = 0.0;
    for (int i=0; i<gridPoints.count();) {
        QPointF A = flight.last();
        // If nextStartPoint is empty, B = gridPoint[i]
        QPointF B = haveNextStartPoint ? nextStartPoint : gridPoints[i];
        qreal nextMoveDistance = distanceFromPointToPoint(A, B);

        // qDebug() << i << nextMoveDistance << distance << mMaxDistancePerFlight;

        // If remaining distance cant reach next point
        // Completing current flight and create next flight
        if (distance + nextMoveDistance > mMaxDistancePerFlight) {
            // Case distance from takeoff to next polygon > mMaxDistancePerFlight
            // throw cannot complete the mission
            if (flight.count() <= 1) {
                qCritical() << "Can\'t complete mission maxDistancePerFlight too low";
            }
            // Calculate last reachable point from remaining distance
            qreal remainingDistance = mMaxDistancePerFlight - distance;
            QPointF AB = B - A;
            haveNextStartPoint = true;
            nextStartPoint = (remainingDistance / nextMoveDistance) * AB + A;

            flight << nextStartPoint;
            
            returnValue << LtpListToGeoList(tangentOrigin, flight);

            // so nextStartPoint to gird[i+1] still > maxDistance
            flight.clear();
            // Start new flight with takeoffPoint
            flight << takeoffPoint;
            distance = 0.0;
        } else {
            flight << B;
            distance += nextMoveDistance;
            haveNextStartPoint = false;
            i++;
        }
    }

    qDebug() << flight;
    returnValue << LtpListToGeoList(tangentOrigin, flight);

    qDebug() << returnValue;

    // Converting List<List<geoCoor>> to QVariantList
    QList<QVariant> output;
    foreach (auto polygon, returnValue) {
        QList<QVariant> list;
        foreach (auto coor, polygon) {
            list.append(QVariant::fromValue(coor));
        }
        output.append(QVariant::fromValue(list));
    }
    return output;
}

QList<QGeoCoordinate> GridCalculation::genGridInsideBound(QList<QGeoCoordinate> bound, float gridSpace, float gridAngle)
{
    // TODO: Correct solution from above method
    QList<QPointF> gridPoints;
    QList<QPointF> interimPoints;
    QList<QGeoCoordinate> returnValue;

    // Convert polygon to Qt coordinate system (y positive is down)
    if(bound.count() <= 2) {
        return returnValue;
    }

    QGeoCoordinate tangentOrigin = bound[0];
    QList<QPointF> polygonPoints = GeoListToLtpList(tangentOrigin, bound);

    double coveredArea = 0.0;
    for (int i=0; i<polygonPoints.count(); i++) {
        if (i != 0) {
            coveredArea += polygonPoints[i - 1].x() * polygonPoints[i].y() - polygonPoints[i].x() * polygonPoints[i -1].y();
        } else {
            coveredArea += polygonPoints.last().x() * polygonPoints[i].y() - polygonPoints[i].x() * polygonPoints.last().y();
        }
    }

    // Generate grid
    gridGenerator(polygonPoints, gridPoints, gridSpace, gridAngle);
    for (int i=0; i<gridPoints.count(); i++) {
        QPointF& point = gridPoints[i];
        QGeoCoordinate geoCoord;
        LtpToGeo(-point.y(), point.x(), -10, tangentOrigin, &geoCoord);
        returnValue += geoCoord;
    }

    return returnValue;
}

double GridCalculation::calculateLength(QList<QPointF> &polygon)
{
    double length = 0.0;
    for (int i=0; i<polygon.count(); i++) {
        length += distanceFromPointToPoint(polygon[i], polygon[(i+1) % polygon.count()]);
    }
    return length;
}
void GridCalculation::GeoToLtp(QGeoCoordinate in, QGeoCoordinate ref, double *x, double *y, double *z)
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

void GridCalculation::LtpToGeo(double x, double y, double z, QGeoCoordinate ref, QGeoCoordinate *out)
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

QPointF GridCalculation::rotatePoint(const QPointF& point, const QPointF& origin, double angle)
{
    QPointF rotated;
    double radians = (M_PI / 180.0) * angle;

    rotated.setX(((point.x() - origin.x()) * cos(radians)) - ((point.y() - origin.y()) * sin(radians)) + origin.x());
    rotated.setY(((point.x() - origin.x()) * sin(radians)) + ((point.y() - origin.y()) * cos(radians)) + origin.y());

    return rotated;
}

void GridCalculation::intersectLinesWithPolygon(const QList<QLineF>& lineList, const QPolygonF& polygon, QList<QLineF>& resultLines)
{
    for (int i=0; i<lineList.count(); i++) {
        int foundCount = 0;
        QLineF intersectLine;
        const QLineF& line = lineList[i];

        for (int j=0; j<polygon.count()-1; j++) {
            QPointF intersectPoint;
            QLineF polygonLine = QLineF(polygon[j], polygon[j+1]);
            auto angleDiff = polygonLine.angleTo(line);
            //skip checking for interection if the angle between lines is too close
            if(angleDiff < 0.5 || fabs(angleDiff - 180) < 0.5 || fabs(angleDiff - 360) < 0.5)
                continue;
            if (line.intersect(polygonLine, &intersectPoint) == QLineF::BoundedIntersection) {
                if (foundCount == 0) {
                    foundCount++;
                    intersectLine.setP1(intersectPoint);
                } else {
                    foundCount++;
                    intersectLine.setP2(intersectPoint);
                    break;
                }
            }
        }

        if (foundCount == 2) {
            resultLines += intersectLine;
        }
    }
}

void GridCalculation::gridGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace, float gridAngle)
{
    gridPoints.clear();

    // Convert polygon to bounding rect
    QPolygonF polygon;
    for (int i=0; i<polygonPoints.count(); i++) {
        polygon << polygonPoints[i];
    }
    polygon << polygonPoints[0];
    QRectF smallBoundRect = polygon.boundingRect();
    QPointF center = smallBoundRect.center();

    // Rotate the bounding rect around it's center to generate the larger bounding rect
    QPolygonF boundPolygon;
    boundPolygon << rotatePoint(smallBoundRect.topLeft(),       center, gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.topRight(),      center, gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.bottomRight(),   center, gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.bottomLeft(),    center, gridAngle);
    boundPolygon << boundPolygon[0];
    QRectF largeBoundRect = boundPolygon.boundingRect();
    //qDebug() << "Rotated bounding rect" << largeBoundRect.topLeft().x() << largeBoundRect.topLeft().y() << largeBoundRect.bottomRight().x() << largeBoundRect.bottomRight().y();

    // Create set of rotated parallel lines within the expanded bounding rect. Make the lines larger than the
    // bounding box to guarantee intersection.
    QList<QLineF> lineList;
    float x = largeBoundRect.bottomRight().x();
    float gridSpacing = -gridSpace;
    while (x > largeBoundRect.topLeft().x()) {
        float yTop =    largeBoundRect.topLeft().y() - 100.0;
        float yBottom = largeBoundRect.bottomRight().y() + 100.0;

        lineList += QLineF(rotatePoint(QPointF(x, yTop), center, gridAngle), rotatePoint(QPointF(x, yBottom), center, gridAngle));
        x += gridSpacing;
    }

    // Now intersect the lines with the polygon
    QList<QLineF> intersectLines;
    intersectLinesWithPolygon(lineList, polygon, intersectLines);

    // This is handy for debugging grid problems, not for release
    //intersectLines = lineList;

    // Make sure all lines are going to same direction. Polygon intersection leads to line which
    // can be in varied directions depending on the order of the intesecting sides.
    QList<QLineF> resultLines;

    adjustLineDirection(intersectLines, resultLines);

    // Turn into a path
    for (int i=0; i<resultLines.count(); i++) {
        const QLineF& line = resultLines[i];
        if (i & 1) {
            gridPoints << line.p2() << line.p1();
        } else {
            gridPoints << line.p1() << line.p2();
        }
    }
}

void GridCalculation::adjustLineDirection(const QList<QLineF>& lineList, QList<QLineF>& resultLines)
{
    for (int i=0; i<lineList.count(); i++) {
        const QLineF& line = lineList[i];
        QLineF adjustedLine;

        if (line.angle() > 179.5) {
            adjustedLine.setP1(line.p2());
            adjustedLine.setP2(line.p1());
        } else {
            adjustedLine = line;
        }

        resultLines += adjustedLine;
    }
}
