#include "optimizegridcalculation.h"
static const float eps = 1e-6; //std::numeric_limits<double>::epsilon();

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

qreal distanceFromPointToPoint(QPointF A, QPointF B)
{
    return qSqrt((A.x() - B.x()) * (A.x() - B.x()) + (A.y() - B.y()) * (A.y() - B.y()));
}

qreal linePointDist(QPointF A, QPointF B, QPointF C, bool isSegment)
{
    qreal dist = cross(A,B,C) / distanceFromPointToPoint(A,B);
    if(isSegment){
        //int dot1 = dot(A,B,C);
        //if(dot1 > 0)return distance(B,C);
        int dot2 = dot(B,A,C);
        if(dot2 > 0)return distanceFromPointToPoint(A,C);
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

OptimizeGridCalculation::OptimizeGridCalculation(QObject *parent)
    : QObject(parent)
{
}

QList<QVariant> OptimizeGridCalculation::genGridInsideBound(QVariantList bound_, float gridSpace, QVariant startPoint_)
{
    QList<QGeoCoordinate> bound;
    // Parsing JS value to C++
    for (const QVariant point : bound_) {
        bound.append(point.value<QGeoCoordinate>());
    }
    QGeoCoordinate startCoordinate = startPoint_.value<QGeoCoordinate>();
    QPointF startPoint(0.0, 0.0);

    QList<QPointF> polygonPoints;
    QList<QList<QGeoCoordinate>> returnValue;

    // Convert polygon to Qt coordinate system (y positive is down)
//    if(bound.count() <= 2) {
//        QList<QVariant> output;
//        foreach (QGeoCoordinate coor, returnValue) {
//            output.append(QVariant::fromValue(coor));
//        }
//        return output;
//    }

    // Translate Lat-Long base to metries base
    polygonFromCoordinate(startCoordinate, bound, polygonPoints);

    int countPolygonPoints = polygonPoints.count();

    // Caculate total area
    double coveredArea = calculateArea(polygonPoints);

    // Which rounded line has minimum distance to start point
    qreal nearestDistance = INFINITY;
    int nearestLineIndex = -1;
    for (int i=0; i<polygonPoints.count(); i++) {
        qreal dist = linePointDist(polygonPoints[i], polygonPoints[(i+1)%countPolygonPoints], startPoint, true);

        if (nearestDistance > dist) {
            nearestDistance = dist;
            nearestLineIndex = i;
        }
    }
    // project snap start point to closest point on rounded line
    QPointF closestPoint = projectPointToLine(polygonPoints[nearestLineIndex], polygonPoints[(nearestLineIndex+1)%countPolygonPoints], startPoint, true);
    qDebug() << closestPoint;

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
    qDebug() << polygonPoints << distanceEachPoints;

    // Brute force number of seperate regions
    // TODO: binary searching number of regions
    int regions = 2;
    while (regions <= 2) {
        returnValue.clear();

        qreal area = coveredArea / regions;
        QList<QPointF> seperatePoints;
        QList<qreal> distanceOfSeperatePoints;

        // Initial start point with first and second vertex in polygon
        // FIXME: if area is too small to create from first and second vertex will error
        qreal referenceDistance = distanceEachPoints[1];
        QPointF referencePoint = polygonPoints[1];

        // TODO: should be 2?
        int lowerindex = 2; // std::lower_bound(distanceEachPoints.begin(), distanceEachPoints.end(), referenceDistance) - distanceEachPoints.begin();

        // Runing binary search : regions times
        for (int p = 0; p < regions-1; p++) {
            double start = referenceDistance, end = distanceEachPoints[countPolygonPoints - 1], mid;
            QPointF midPoint;

            // TODO: start >= end? beware Infinite loop
            while(end - start > eps) {
                mid = (start + end) / 2.0;
                midPoint = distanceToPoint(polygonPoints, distanceEachPoints, mid);

                // TODO: qUpperBound return iterator? should convert to array index first
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
            qDebug() << midPoint << mid;
            referenceDistance = mid;
            referencePoint = midPoint;
        }

        // Debug
        QList<QPointF> a;
        a << polygonPoints[0];
        int i = 1, j = 0;
        while(i < countPolygonPoints || j < seperatePoints.count()) {
            // Seperate point j is on line i-1
            if (j < seperatePoints.count() && distanceOfSeperatePoints[j] < distanceEachPoints[i]) {
                a << seperatePoints[j];

                qDebug() << "area : " << calculateArea(a);

                // Grid generator
                QList<QPointF> b;
                gridOptimizeGenerator(a, b, gridSpace);
                QList<QGeoCoordinate> coorB;

                for (int i=0; i<b.count(); i++) {
                    QPointF& point = b[i];
                    QGeoCoordinate geoCoord;
                    LtpToGeo(-point.y(), point.x(), -10, startCoordinate, &geoCoord);
                    coorB << geoCoord;
                }
                returnValue << coorB;
                // Initialize new Area with start point and lastest seperate point
                a.clear();
                a << polygonPoints[0] << seperatePoints[j];
                j++;
            } else {
                a << polygonPoints[i];
                i++;
            }
        }
        qDebug() << "area : " << calculateArea(a);

        QList<QPointF> b;
        gridOptimizeGenerator(a, b, gridSpace);
        QList<QGeoCoordinate> coorB;

        for (int i=0; i<b.count(); i++) {
            QPointF& point = b[i];
            QGeoCoordinate geoCoord;
            LtpToGeo(-point.y(), point.x(), -10, startCoordinate, &geoCoord);
            coorB << geoCoord;
        }
        returnValue << coorB;
        
        qDebug() << returnValue;

        regions++;
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

double OptimizeGridCalculation::calculateLength(QList<QPointF> &polygon)
{
    double length = 0.0;
    for (int i=0; i<polygon.count(); i++) {
        length += distanceFromPointToPoint(polygon[i], polygon[(i+1) % polygon.count()]);
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

void OptimizeGridCalculation::gridGenerator(const QList<QPointF> &polygonPoints, QList<QPointF> &gridPoints, float gridSpace, float gridAngle)
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

//void OptimizeGridCalculation::polygonFromCoordinate(QGeoCoordinate tangentOrigin, QList<QGeoCoordinate> coordList, QList<QPointF> &polygonPoints)
//{
//    polygonPoints.clear();
//    polygonPoints += QPointF(0, 0);

//    for (int i=1; i< coordList.count(); i++) {
//        double y, x, down;
//        auto pt = coordList[i];
//        GeoToLtp(pt, tangentOrigin, &y, &x, &down);
//        polygonPoints += QPointF(x, -y);
//    }
//}

QPointF OptimizeGridCalculation::rotatePoint(const QPointF& point, const QPointF& origin, double angle)
{
    QPointF rotated;
    double radians = (M_PI / 180.0) * angle;

    rotated.setX(((point.x() - origin.x()) * cos(radians)) - ((point.y() - origin.y()) * sin(radians)) + origin.x());
    rotated.setY(((point.x() - origin.x()) * sin(radians)) + ((point.y() - origin.y()) * cos(radians)) + origin.y());

    return rotated;
}

void OptimizeGridCalculation::intersectLinesWithPolygon(const QList<QLineF>& lineList, const QPolygonF& polygon, QList<QLineF>& resultLines)
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

void OptimizeGridCalculation::adjustLineDirection(const QList<QLineF>& lineList, QList<QLineF>& resultLines)
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

