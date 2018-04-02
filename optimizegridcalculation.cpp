#include "optimizegridcalculation.h"

static const qreal eps_ = 1e-6;
#define PREV(i, count) (i + count - 1) % count
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

QPointF projectPointToLineSegment(QPointF A, QPointF B, QPointF p) {
    // vector from A to B
    QPointF AB = B - A;
    // squared distance from A to B
    qreal ABsquared = QPointF::dotProduct(AB, AB);

    if (ABsquared == 0) {
        // A and B are the same point
        return A;
    } else {
        // vector from A to p
        QPointF Ap = p - A;
        
        qreal t = QPointF::dotProduct(Ap, AB) / ABsquared;
        if (t < 0.0)  {
            // "Before" A on the line, just return A
            return A;
        } else if (t > 1.0) {
            //"After" B on the line, just return B
            return B;
        } else {
            // projection lines "inbetween" A and B on the line
            return A + t * AB;
        }
    }
}

QPointF projectPointToLine(QPointF A, QPointF B, QPointF C, bool isSegment)
{
    if(isSegment){
        return projectPointToLineSegment(A, B, C);
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

OptimizeGridCalculation::OptimizeGridCalculation(qreal speed, qreal minute, QObject *parent)
    : GridCalculation(speed, minute, parent)
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
    // qDebug() << bound;
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
    QList<qreal> angles;

    // Sort polygon
    sortPolygonPointOrder(polygonPoints);

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
    if (closestPoint == polygonPoints[nearestLineIndex]) {
    } else if (closestPoint == polygonPoints[NEXT(nearestLineIndex, countPolygonPoints)]) {
        nearestLineIndex = (nearestLineIndex + 1) % countPolygonPoints;
    } else {
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

    // qDebug() << polygonPoints;

    // Calculate distance from start point to each polygon vertex following the rounded line
    QList<qreal> distanceEachPoints;

    qreal totalDistance = 0.0;
    distanceEachPoints << 0.0;
    for (int i=0; i<polygonPoints.count(); i++) {
        totalDistance += distanceFromPointToPoint(polygonPoints[i], polygonPoints[(i+1)%countPolygonPoints]);
        distanceEachPoints << totalDistance;
    }
    // qDebug() << "Distance : " << distanceEachPoints;

    // Brute force number of seperate regions
    // TODO: binary searching number of regions
    int regions = 1;
    bool error = false;

    while (regions < this->mMaxRegions) {
        qDebug() << "Region: " << regions;
        returnValue.clear();
        angles.clear();

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
            referenceDistance = mid;
            referencePoint = midPoint;
        }

        bool drawable = true;
        QList<QPointF> a;

        int i = 1, j = 0;
        while(i < countPolygonPoints || j < seperatePoints.count()) {
            // Seperate point j is on line i-1
            if (j < seperatePoints.count() && distanceOfSeperatePoints[j] < distanceEachPoints[i]) {
                a << seperatePoints[j];

                sortPolygonPointOrder(a);
                Q_ASSERT(calculateArea(a) >= 0);
                a.prepend(polygonPoints[0]);

                // Grid generator
                QList<QPointF> b;
                b << takeoffPoint;
                angles << gridOptimizeGenerator(a, b, gridSpace);
                
                // No point retern
                if (b.count() == 0) {
                    qDebug
                    () << "Error on optimize grid";
                    error = true;
                }
                // If total length of grid > maxDistance, should divinded into more region
                if (calculateLength(b) > mMaxDistancePerFlight) {
                    drawable = false;
                    break;
                }

                returnValue << LtpListToGeoList(tangentOrigin, b);
                // Initialize new Area with start point and lastest seperate point
                a.clear();
                a << seperatePoints[j];
                j++;
            } else {
                a << polygonPoints[i];
                i++;
            }
        }
        if (drawable) {
            sortPolygonPointOrder(a);
            Q_ASSERT(calculateArea(a) >= 0);
            a.prepend(polygonPoints[0]);

            QList<QPointF> b;
            b << takeoffPoint;
            angles << gridOptimizeGenerator(a, b, gridSpace);

            // No point retern
            if (b.count() == 0) {
                qDebug() << "Error on optimize grid";
                error = true;
            }
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

    if (error) {
        return GridCalculation::genGridInsideBound(bound_, takeoffPoint_, gridSpace, 0);
    }

    QList<QVariant> output;
    for (int i = 0; i < returnValue.count(); ++i) {
        const QList<QGeoCoordinate> &polygon = returnValue[i];
        QVariantMap obj;
        obj.insert("angle", angles[i]);
        QList<QVariant> list;
        foreach (auto coor, polygon) {
            list.append(QVariant::fromValue(coor));
        }
        obj.insert("grid", list);

        output.append(QVariant::fromValue(obj));
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

void OptimizeGridCalculation::sortPolygonPointOrder(QList<QPointF> &polygon, bool reverseOrder)
{
    // TODO: Convex sorting
    if (calculateArea(polygon) * (reverseOrder ? -1 : 1) < 0.0) {
        QList<QPointF> temp;
        int i = 0, count = polygon.count();
        do {
            temp << polygon[i];
            i = PREV(i, count);
        } while (i!=0);
        polygon = temp;
    }
}

qreal OptimizeGridCalculation::linePointDist(QPointF A, QPointF B, QPointF p, bool isSegment)
{
    if (isSegment) {
        QPointF proj = projectPointToLineSegment(A, B, p);
        return distanceFromPointToPoint(proj, p);
    }
    qreal dist = cross(A,B,p) / distanceFromPointToPoint(A,B);
    return abs(dist);
}

qreal lengthToOrigin(QPointF p) {
    return qSqrt(p.x() * p.x() + p.y() * p.y());
}

qreal OptimizeGridCalculation::gridOptimizeGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace)
{
    QList<QPointF> a = polygonPoints;
    // Choose flying direction from longest side
    // Case reverese direction is better
    QPointF ab = a[1] - a[0];
    if (distanceFromPointToPoint(a[0], a[1]) < distanceFromPointToPoint(a[0], a.last())) {
        ab = a.last() - a[0];
        // qDebug() << "Flip";
    }
    QPointF ac(0.0, 1.0); // ab.y() / qAbs(ab.y()));
    qreal angle = qAcos( QPointF::dotProduct(ab, ac) / lengthToOrigin(ab) / lengthToOrigin(ac) ) / M_PI * 180.0;
    angle = ab.x() < 0 ? 180 + angle : -angle;

    // qDebug() << "Angle" << angle << ab << ac << a[0] << a[1] << a.last();

    gridGenerator(a, gridPoints, gridSpace, angle);

    return angle;
}


void OptimizeGridCalculation::gridGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace, float gridAngle)
{
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
    boundPolygon << rotatePoint(smallBoundRect.topLeft(),       center, -gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.topRight(),      center, -gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.bottomRight(),   center, -gridAngle);
    boundPolygon << rotatePoint(smallBoundRect.bottomLeft(),    center, -gridAngle);
    boundPolygon << boundPolygon[0];

    QRectF largeBoundRect = boundPolygon.boundingRect();
    //qDebug() << "Rotated bounding rect" << largeBoundRect.topLeft().x() << largeBoundRect.topLeft().y() << largeBoundRect.bottomRight().x() << largeBoundRect.bottomRight().y();

    // Create set of rotated parallel lines within the expanded bounding rect. Make the lines larger than the
    // bounding box to guarantee intersection.
    QList<QLineF> lineList;
    float x = largeBoundRect.bottomRight().x();
    float gridSpacing = -gridSpace;

    float yTop =    largeBoundRect.topLeft().y() - 100.0;
    float yBottom = largeBoundRect.bottomRight().y() + 100.0;

    while (x > largeBoundRect.topLeft().x()) {
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

    if (intersectLines.count() == 0) return;

    // Sort list of line by closest to initial point of polygon
    float d1 = distanceFromPointToPoint(polygon[0], intersectLines[0].p1());
    float d2 = distanceFromPointToPoint(polygon[0], intersectLines[0].p2());
    float d3 = distanceFromPointToPoint(polygon[0], intersectLines.last().p1());
    float d4 = distanceFromPointToPoint(polygon[0], intersectLines.last().p2());
    float minD = qMin(d1, qMin(d2, qMin(d3, d4)));

    // qDebug() << "D" << d1 << d2 << d3 << d4 << minD;
    if (minD == d2 || minD == d4) {
        for (int i=0; i<intersectLines.count(); i++) {
            const QLineF& line = intersectLines[i];
            QLineF adjustedLine;
            adjustedLine.setP1(line.p2());
            adjustedLine.setP2(line.p1());

            resultLines += adjustedLine;
        }
    } else {
        resultLines = intersectLines;
    }
    // qDebug() << resultLines;

    // Turn into a path
    if (minD == d1 || minD == d2 || minD == d4) {
        for (int i=0; i<resultLines.count(); i++) {
            const QLineF& line = resultLines[i];
            if (i & 1) {
                gridPoints << line.p2() << line.p1();
            } else {
                gridPoints << line.p1() << line.p2();
            }
        }
    } else {
        for (int i=resultLines.count()-1; i>=0; i--) {
            const QLineF& line = resultLines[i];
            if (i & 1) {
                gridPoints << line.p2() << line.p1();
            } else {
                gridPoints << line.p1() << line.p2();
            }
        }
    }
    // qDebug() << gridPoints;
}
