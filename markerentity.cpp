#include "markerentity.h"
#include "cameracontroller.h"

float MarkerEntity::headRadius = 300;
float MarkerEntity::headHeight = 600;
float MarkerEntity::defaultHeight = 500;

MarkerEntity::MarkerEntity(Qt3DCore::QNode *parent)
    : Entity(parent)
{
    //! [0]
    mHead = new Qt3DExtras::QCylinderMesh;
    mHead->setRadius(headRadius);
    mHead->setLength(headHeight);

    mHeadTransform = new Qt3DCore::QTransform;
//    mHeadTransform->setTranslation(QVector3D(0, headHeight / 2, 0));

    mHeadMaterial = new Qt3DExtras::QPhongMaterial;
    mHeadMaterial->setAmbient(QColor(255, 0, 0));
    mHeadMaterial->setShininess(1);
//    mHeadMaterial->setAlpha(0.5);

//    Qt3DCore::QEntity* head = new Qt3DCore::QEntity(this);
//    head->addComponent(mHead);
//    head->addComponent(mHeadMaterial);
//    head->addComponent(mHeadTransform);

    //! [1]
    mBottom = new Qt3DExtras::QConeMesh;
    mBottom->setTopRadius(headRadius);
    mBottom->setBottomRadius(0);
    mBottom->setLength(headHeight);

    mBottomTransform = new Qt3DCore::QTransform;

    mBottomMaterial = new Qt3DExtras::QPhongMaterial;
    mBottomMaterial->setAmbient(QColor(255, 0, 0));
    mBottomMaterial->setShininess(1);

    Qt3DCore::QEntity* bottom = new Qt3DCore::QEntity(this);
    bottom->addComponent(mBottom);
    bottom->addComponent(mBottomMaterial);
    bottom->addComponent(mBottomTransform);

    connect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
}

void MarkerEntity::setPosition(QVector3D position)
{
    mPosition = position;

    mHeadTransform->setTranslation(mPosition + QVector3D(0, mHeight, 0));
    mBottomTransform->setTranslation(mPosition);

    emit positionChanged();
}

void MarkerEntity::setHeight(const float height)
{
    mHeight = height;

    mHeadTransform->setTranslation(mPosition + QVector3D(0, mHeight, 0));

    emit heightChanged();
}

void MarkerEntity::setCamera(Qt3DRender::QCamera *camera)
{
    if (camera == mCamera) return;

    if (mCamera) {
        disconnect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
    }

    mCamera = camera;
    emit cameraChanged();

    connect(mCamera, &Qt3DRender::QCamera::positionChanged, this, &MarkerEntity::onCameraPositionChanged);
}

void MarkerEntity::onCameraPositionChanged(const QVector3D &position)
{
    float scaleFactor = 12000.0f;
    float scale = (position - mHeadTransform->translation()).length() / scaleFactor;

    qDebug() << "ENE" << position.y() << scale;

    // TODO:
    mHeadTransform->setScale(scale);
}

Entity::Type MarkerEntity::type() const
{
    return Entity::Marker;
}
