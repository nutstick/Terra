#include "markerentity.h"
#include "cameracontroller.h"
#include "sphericalmercator.h"
#include "map.h"
#include "linemesh.h"
#include <Qt3DRender/QPickEvent>
#include <Qt3DRender/QPickTriangleEvent>
#include "mapsettings.h"

float MarkerEntity::headRadius = 300;
float MarkerEntity::headHeight = 600;
float MarkerEntity::defaultHeight = 500;

MarkerEntity::MarkerEntity(Qt3DCore::QNode *parent)
    : Entity(parent)
    , mHeight(defaultHeight)
    , mMap(nullptr)
{
    //! [0]
    Qt3DCore::QEntity* head = new Qt3DCore::QEntity(this);

    mHead = new Qt3DExtras::QCylinderMesh;
    mHead->setRadius(headRadius);
    mHead->setLength(headHeight);

    mHeadTransform = new Qt3DCore::QTransform;
    mHeadTransform->setTranslation(QVector3D(0, headHeight / 2, 0));

    mHeadMaterial = new Qt3DExtras::QPhongMaterial;
    mHeadMaterial->setAmbient(QColor(255, 255, 0));
    mHeadMaterial->setShininess(1);
//    mHeadMaterial->setAlpha(0.5);;

//    Qt3DRender::QObjectPicker *objectPicker = new Qt3DRender::QObjectPicker(head);
//    objectPicker->setHoverEnabled(true);
//    objectPicker->setDragEnabled(true);
//    connect(objectPicker, &Qt3DRender::QObjectPicker::clicked, this, &MarkerEntity::onMousePressed);

    head->setObjectName("head");
    head->addComponent(mHead);
    head->addComponent(mHeadMaterial);
    head->addComponent(mHeadTransform);
//    head->addComponent(objectPicker);

    //! [1]
    mBottom = new Qt3DExtras::QConeMesh;
    mBottom->setTopRadius(headRadius);
    mBottom->setBottomRadius(0);
    mBottom->setLength(headHeight);

    mBottomTransform = new Qt3DCore::QTransform;
    mBottomTransform->setTranslation(QVector3D(0, 0, 0));

    mBottomMaterial = new Qt3DExtras::QPhongMaterial;
    mBottomMaterial->setAmbient(QColor(255, 0, 0));
    mBottomMaterial->setShininess(1);

    Qt3DCore::QEntity* bottom = new Qt3DCore::QEntity(this);
    bottom->addComponent(mBottom);
    bottom->addComponent(mBottomMaterial);
    bottom->addComponent(mBottomTransform);

    //! [2]
    QList<QVector4D> points;
    points.append(mHeadTransform->translation().toVector4D());
    points.append(mBottomTransform->translation().toVector4D());
    mLine = new LineMesh(points);

    Qt3DCore::QTransform* lineTransform = new Qt3DCore::QTransform;

    mLineMaterial = new Qt3DExtras::QPhongMaterial;
    mLineMaterial->setAmbient(QColor(0, 255, 0));
    mLineMaterial->setShininess(1);

    Qt3DCore::QEntity* line = new Qt3DCore::QEntity(this);
    line->addComponent(mLine);
    line->addComponent(mLineMaterial);
    line->addComponent(lineTransform);

    connect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
}

void MarkerEntity::setPosition(QVector3D position)
{
    mPosition = position;
    emit positionChanged();

    update();
}

void MarkerEntity::setPosition(QGeoCoordinate coord)
{
    // Translate Lat-Lon-Att to World Space position
    QVector3D newPosition = SphericalMercator::instance()->geoCoordinateToWorldSpace(coord);

    if (newPosition == mPosition) return;

    mPosition = newPosition;
    emit positionChanged();
    // Apply new position to marker
    update();
}

void MarkerEntity::setHeight(const float height)
{
    mHeight = height;
    emit heightChanged();

    update();
}

void MarkerEntity::setCamera(Qt3DRender::QCamera *camera)
{
    if (camera == mCamera) return;

    if (mCamera) {
        disconnect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
    }

    mCamera = camera;
    emit cameraControllerChanged();

    connect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
}

void MarkerEntity::setCameraController(CameraController *cameraController)
{
    if (cameraController == mCameraController) return;

    mCameraController = cameraController;
    emit cameraChanged();
}

void MarkerEntity::setMap(Map *map)
{
    if (mMap == map) return;

    mMap = map;

    emit mapChanged();

    update();
}

Entity::Type MarkerEntity::type() const
{
    return Entity::Marker;
}

bool MarkerEntity::rayOBBIntersection(QVector3D rayOrigin, QVector3D rayDirection, float &distance)
{
    //![0]
    //! AABB -> (-headRadius, -headRadius, -headHeight / 2.0)
    QVector3D AABBmin;
    AABBmin = QVector3D(-headRadius, -headRadius, -headHeight / 2.0f);// * mHeadTransform->scale() + mHeadTransform->translation();
    QVector3D AABBmax;
    AABBmax = QVector3D(headRadius, headRadius, headHeight / 2.0f);// * mHeadTransform->scale() + mHeadTransform->translation();

//    qDebug() << rayOrigin << rayDirection << rayOrigin + rayDirection * -12000;
    float tMin = 0.0f;
    float tMax = 100000.0f;
    QVector3D OBBposition(mHeadTransform->matrix().column(3));
    QVector3D delta = OBBposition - rayOrigin;

    // Test intersection with the 2 planes perpendicular to the OBB's X axis
    QVector3D xAxis(mHeadTransform->matrix().column(0));
    float e = QVector3D::dotProduct(xAxis, delta);
    float f = QVector3D::dotProduct(rayDirection, xAxis);

    if ( qFabs(f) > 0.001f ) {
        float t1 = (e + AABBmin.x()) / f; // Intersection with the "left" plane
        float t2 = (e + AABBmax.x()) / f; // Intersection with the "right" plane
        // t1 and t2 now contain distances betwen ray origin and ray-plane intersections

        // We want t1 to represent the nearest intersection,
        // so if it's not the case, invert t1 and t2
        if (t1 > t2){
            float w = t1; t1 = t2; t2 = w; // swap t1 and t2
        }

        // tMax is the nearest "far" intersection (amongst the X,Y and Z planes pairs)
        if (t2 < tMax)
            tMax = t2;
        // tMin is the farthest "near" intersection (amongst the X,Y and Z planes pairs)
        if (t1 > tMin)
            tMin = t1;

        // And here's the trick :
        // If "far" is closer than "near", then there is NO intersection.
        // See the images in the tutorials for the visual explanation.
        if (tMax < tMin)
            return false;
    } else{ // Rare case : the ray is almost parallel to the planes, so they don't have any "intersection"
        if(-e + AABBmin.x() > 0.0f || -e + AABBmax.x() < 0.0f)
            return false;
    }

    // Test intersection with the 2 planes perpendicular to the OBB's Y axis
    QVector3D yAxis(mHeadTransform->matrix().column(1));
    e = QVector3D::dotProduct(yAxis, delta);
    f = QVector3D::dotProduct(rayDirection, yAxis);

    if (qFabs(f) > 0.001f){
        float t1 = (e + AABBmin.y()) / f;
        float t2 = (e + AABBmax.y()) / f;

        if (t1 > t2) { float w = t1; t1 = t2; t2 = w; }

        if (t2 < tMax)
            tMax = t2;
        if (t1 > tMin)
            tMin = t1;
        if (tMin > tMax)
            return false;

    } else{
        if(-e + AABBmin.y() > 0.0f || -e + AABBmax.y() < 0.0f)
            return false;
    }

    // Test intersection with the 2 planes perpendicular to the OBB's Z axis
    QVector3D zAxis(mHeadTransform->matrix().column(2));
    e = QVector3D::dotProduct(zAxis, delta);
    f = QVector3D::dotProduct(rayDirection, zAxis);

    if (qFabs(f) > 0.001f){
        float t1 = (e + AABBmin.z()) / f;
        float t2 = (e + AABBmax.z()) / f;

        if (t1 > t2) { float w = t1; t1 = t2; t2 = w; }

        if (t2 < tMax)
            tMax = t2;
        if (t1 > tMin)
            tMin = t1;
        if (tMin > tMax)
            return false;

    } else{
        if(-e + AABBmin.z() > 0.0f || -e + AABBmax.z() < 0.0f)
            return false;
    }

    distance = tMin;
    return true;
}

void MarkerEntity::onCameraPositionChanged(const QVector3D &position)
{
    float scaleFactor = 3600.0f * qLn(position.y());
    float scale = position.y() / scaleFactor;

    // Set scale using scale factor
    mHeadTransform->setScale(scale);
    mBottomTransform->setScale(scale);
    // Update position
    update();
}

void MarkerEntity::onMousePressed(Qt3DRender::QPickEvent *pick)
{
    //Ignore pick events if the entity is disabled
    if (!isEnabled()) {
        pick->setAccepted(false);
        return;
    }

//    qDebug() << qobject_cast<Qt3DCore::QEntity*>(sender()->parent())->objectName();
//    qDebug() << pick->localIntersection() << pick->worldIntersection();
    qDebug() << "tile touched";
    cameraController()->setMarkerHeadPressed(this, pick->position());
    pick->setAccepted(true);
}

void MarkerEntity::update()
{
    float mPerPixel = 40075000.0f / MapSettings::basePlaneDimension();

    mHeadTransform->setTranslation(mPosition + QVector3D(0, mHeight / mPerPixel + headHeight / 2.0f, 0));
    mBottomTransform->setTranslation(mPosition + QVector3D(0, mBottomTransform->scale() * headHeight / 2.0f, 0));

    QList<QVector4D> points;
    points.append(mHeadTransform->translation().toVector4D());
    points.append(mBottomTransform->translation().toVector4D());
    mLine->setVertices(points);
}
