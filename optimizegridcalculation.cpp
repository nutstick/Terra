#include "optimizegridcalculation.h"

static const qreal eps_ = 1e-6;
#define NEXT(i, count) (i + 1) % count

qreal dot(QPointF A, QPointF B, QPointF C)
{
    QPointF AB = QPointF();
    QPointF BC = QPointF();
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
    QPointF AB = QPointF();
    QPointF AC = QPointF();
    AB.setX(B.x()-A.x());
    AB.setY(B.y()-A.y());
    AC.setX(C.x()-A.x());
    AC.setY(C.y()-A.y());
    qreal cross = AB.x() * AC.y() - AB.y() * AC.x();
    return cross;
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

QPointF distanceToPoint(QList<QPointF> polygonPoints, QList<qreal> distanceEachPoints, qreal d)
{
    int pointOnLine = std::lower_bound(distanceEachPoints.begin(), distanceEachPoints.end(), d) - distanceEachPoints.begin();
    pointOnLine--;

    // Left over distance on rounded line
    qreal leftOverDistance = d - distanceEachPoints[pointOnLine];
    QPointF lineVector = polygonPoints[(pointOnLine + 1) % polygonPoints.count()] - polygonPoints[pointOnLine];

    // A + d / AB.AB * AB
    QPointF result = polygonPoints[pointOnLine] + leftOverDistance / qSqrt(QPointF::dotProduct(lineVector, lineVector)) * lineVector;

    return result;
}

OptimizeGridCalculation::OptimizeGridCalculation(qreal maxDistancePerFlight, QObject *parent)
    : GridCalculation(maxDistancePerFlight, parent)
    , mMaxRegions(50)
{
}

QList<QVariant> OptimizeGridCalculation::genGridInsideBound(QVariantList bound_, QVariant takeoffPoint_, float gridSpace, float gridAngle)
{
    Q_UNUSED(gridAngle);
    // Convert varinat list to GeoCoordinate list
    QList<QGeoCoordinate> bound;
    for (const QVariant point : bound_) {
        bound.append(point.value<QGeoCoordinate>());
    }
    // Convert takeoff point
    QGeoCoordinate tangentOrigin = takeoffPoint_.value<QGeoCoordinate>();
    QPointF takeoffPoint(0.0, 0.0);

    // If least than 2 point in line return empty list
    if(bound.count() <= 2) {
        QList<QVariant> output;
        // TODO: Throw error
        return output;
    }

    // Translate Lat-Long base to metries base
    QList<QPointF> polygonPoints = GeoListToLtpList(tangentOrigin, bound);
    QList<QList<QGeoCoordinate>> returnValue;

    int countPolygonPoints = polygonPoints.count();

    // Calculate covered area
    double coveredArea = calculateArea(polygonPoints);

    // Which rounded line has minimum distance to start point
    qreal nearestDistance = INFINITY;
    int nearestLineIndex = -1;
    for (int i=0; i<countPolygonPoints; i++) {
        qreal dist = linePointDist(polygonPoints[i], polygonPoints[NEXT(i, countPolygonPoints)], takeoffPoint, true);

        if (nearestDistance > dist) {
            nearestDistance = dist;
            nearestLineIndex = i;
        }
    }

    // Nearest line should assign
    Q_ASSERT(nearestLineIndex != -1);
    
    // project snap start point to closest point on rounded line
    QPointF closestPoint = projectPointToLine(polygonPoints[nearestLineIndex], polygonPoints[NEXT(nearestLineIndex, countPolygonPoints)], takeoffPoint, true);

    // Rearrange polygon with new closest point
    QList<QPointF> polygonPoints_;
    // Case: closestPoint is not a polygon point, start from closest point
    if (closestPoint != polygonPoints[nearestLineIndex]) {
        polygonPoints_ << closestPoint;
        nearestLineIndex = (nearestLineIndex + 1) % countPolygonPoints;
    }
    // Rearrange polygon with new closest point
    int t_ = nearestLineIndex;
    do {
        polygonPoints_  << polygonPoints[t_];
        t_ = (t_ + 1) % polygonPoints.count();
    } while(t_ != nearestLineIndex);

    polygonPoints = polygonPoints_;
    countPolygonPoints = polygonPoints.count();

    // Calculate distance from start point to each polygon vertex following the rounded line
    QList<qreal> distanceEachPoints;

    qreal totalDistance = 0.0;
    distanceEachPoints << 0.0;
    for (int i=0; i<polygonPoints.count(); i++) {
        totalDistance += distanceFromPointToPoint(polygonPoints[i], polygonPoints[(i+1)%countPolygonPoints]);
        distanceEachPoints << totalDistance;
    }
    qDebug() << "Distance : " << distanceEachPoints;

    // Brute force number of seperate regions
    // TODO: binary searching number of regions
    int regions = 1;
    while (regions < this->mMaxRegions) {
        qDebug() << "Region: " << regions;
        returnValue.clear();

        qreal area = coveredArea / regions;
        QList<QPointF> seperatePoints;
        QList<qreal> distanceOfSeperatePoints;

        // Initial start point with first and second vertex in polygon
        // FIXME: if area is too small to create from first and second vertex will error
        qreal referenceDistance = distanceEachPoints[1];
        QPointF referencePoint = polygonPoints[1];

        int lowerindex = 2; // std::lower_bound(distanceEachPoints.begin(), distanceEachPoints.end(), referenceDistance) - distanceEachPoints.begin();

        // Runing binary search : regions times
        for (int p = 0; p < regions-1; p++) {
            double start = referenceDistance, end = distanceEachPoints[countPolygonPoints - 1], mid;
            QPointF midPoint;

            // TODO: start >= end? beware Infinite loop
            while(end - start > eps_) {
                mid = (start + end) / 2.0;
                midPoint = distanceToPoint(polygonPoints, distanceEachPoints, mid);

                int upperindex = std::lower_bound(distanceEachPoints.begin(), distanceEachPoints.end(), mid) - distanceEachPoints.begin();
                upperindex--;

                // Generate cover area from reference point to mid distance point along with polygon's path
                // Covering point
                // [ polygon vertex 0, reference point, [ lowerBound(reference point) ... upperBound(mid point) ], mid point ]
                QList<QPointF> a;
                a << polygonPoints[0];
                a << referencePoint;
                for (int i=lowerindex; i<=upperindex; i++) {
                    a << polygonPoints[i];
                }
                a << midPoint;

                // TODO: Increase performance if pre-calculate area from vertex i to j
                // calcArea = area of (polygon[0], reference point, polygon[lowerindex]) + Area[lowerindex][upperindex]
                //              + area of (polygon[0], polygon[upperindex], mid point)
                // case lowerindex > upperindex, calcArea = area of (polygon[0], reference point, mid point)
                qreal calcArea = calculateArea(a);

                if (calcArea < area) {
                    start = mid + eps;
                } else {
                    end = mid - eps;
                }
            }

            seperatePoints << midPoint;
            distanceOfSeperatePoints << mid;
            // qDebug() << midPoint << mid;
            referenceDistance = mid;
            referencePoint = midPoint;
        }

        bool drawable = true;
        QList<QPointF> a;
        a << polygonPoints[0];
        int i = 1, j = 0;
        while(i < countPolygonPoints || j < seperatePoints.count()) {
            // Seperate point j is on line i-1
            if (j < seperatePoints.count() && distanceOfSeperatePoints[j] < distanceEachPoints[i]) {
                a << seperatePoints[j];

                qDebug() << "area : " << calculateArea(a);
                Q_ASSERT(calculateArea(a) >= 0);

                // Grid generator
                QList<QPointF> b;
                b << takeoffPoint;
                gridOptimizeGenerator(a, b, gridSpace);
                
                // If total length of grid > maxDistance, should divinded into more region
                if (calculateLength(b) > mMaxDistancePerFlight) {
                    drawable = false;
                    break;
                }
                // qDebug() << b;
                returnValue << LtpListToGeoList(tangentOrigin, b);
                // Initialize new Area with start point and lastest seperate point
                a.clear();
                a << polygonPoints[0] << seperatePoints[j];
                j++;
            } else {
                a << polygonPoints[i];
                i++;
            }
        }
        if (drawable) {
            qDebug() << "area : " << calculateArea(a);
            Q_ASSERT(calculateArea(a) >= 0);

            QList<QPointF> b;
            b << takeoffPoint;
            gridOptimizeGenerator(a, b, gridSpace);
            // If total length of grid > maxDistance, should divinded into more region
            if (calculateLength(b) > mMaxDistancePerFlight) {
                drawable = false;
            }
            returnValue << LtpListToGeoList(tangentOrigin, b);
        }

        if (drawable) {
            break;
        } else {
            regions++;
        }
    }

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

qreal OptimizeGridCalculation::linePointDist(QPointF A, QPointF B, QPointF C, bool isSegment)
{
    qreal dist = cross(A,B,C) / distanceFromPointToPoint(A,B);
    if (isSegment) {
        //int dot1 = dot(A,B,C);
        //if(dot1 > 0)return distance(B,C);
        int dot2 = dot(B,A,C);
        if (dot2 > 0) return distanceFromPointToPoint(A,C);
    }
    return abs(dist);
}

void OptimizeGridCalculation::gridOptimizeGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace)
{
    QList<QPointF> a = polygonPoints;
    // Choose flying direction from longest side
    // Case reverese direction is better
    if (distanceFromPointToPoint(a[0], a[1]) < distanceFromPointToPoint(a[0], a.last())) {
        // Reverse vertex order
        QList<QPointF> b;
        for (int ii=0; ii<a.count(); ++ii) {
                b << a[a.count() - 1 - ii];
        }
        a = b;
    }
    QPointF ab = a[1] - a[0];
    // FIXME: QPointF(0.0, 1.0) or QPointF(1.0, 0.0)?
    qreal angle = qAcos(QPointF::dotProduct(ab, QPointF(0.0, 1.0)) / ab.manhattanLength()) / M_PI * 180.0;

    gridGenerator(a, gridPoints, gridSpace, angle);
}
