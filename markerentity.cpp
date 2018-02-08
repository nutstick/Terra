#include "markerentity.h"
#include "cameracontroller.h"
#include "sphericalmercator.h"
#include "map.h"
#include "linemesh.h"
#include <Qt3DRender/QPickEvent>
#include <Qt3DRender/QPickTriangleEvent>

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

    Qt3DRender::QObjectPicker *objectPicker = new Qt3DRender::QObjectPicker(head);
    objectPicker->setHoverEnabled(true);
    objectPicker->setDragEnabled(true);
    connect(objectPicker, &Qt3DRender::QObjectPicker::clicked, this, &MarkerEntity::onMousePressed);
    connect(objectPicker, &Qt3DRender::QObjectPicker::entered, []{ qDebug() << "En\n";});
    connect(objectPicker, &Qt3DRender::QObjectPicker::exited, []{ qDebug() << "Ex\n";});

    head->setObjectName("head");
    head->addComponent(mHead);
    head->addComponent(mHeadMaterial);
    head->addComponent(mHeadTransform);
    head->addComponent(objectPicker);

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

    if (mMap) {
        disconnect(mMap, &Map::basePlaneDimesionChanged, this, &MarkerEntity::onBasePlaneDimensionChanged);
    }

    mMap = map;

    connect(mMap, &Map::basePlaneDimesionChanged, this, &MarkerEntity::onBasePlaneDimensionChanged);

    emit mapChanged();

    update();
}

Entity::Type MarkerEntity::type() const
{
    return Entity::Marker;
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

void MarkerEntity::onBasePlaneDimensionChanged()
{
    // Marker position render using base plane dimesion as relative height
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
    //qDebug() << "tile touched";
    pick->setAccepted(true);
}

void MarkerEntity::update()
{
    if (!mMap || mMap->basePlaneDimesion() <= 1.0e-10) return;

    float mPerPixel = 40075000.0f / mMap->basePlaneDimesion();

    mHeadTransform->setTranslation(mPosition + QVector3D(0, mHeight / mPerPixel + headHeight / 2.0f, 0));
    mBottomTransform->setTranslation(mPosition + QVector3D(0, mBottomTransform->scale() * headHeight / 2.0f, 0));

    QList<QVector4D> points;
    points.append(mHeadTransform->translation().toVector4D());
    points.append(mBottomTransform->translation().toVector4D());
    mLine->setVertices(points);
}
