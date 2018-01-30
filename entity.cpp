#include "entity.h"

Entity::Entity(Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , mLayer(new Qt3DRender::QLayer(this))
    , mCamera(new Qt3DRender::QCamera(this))
{
    addComponent(mLayer);
}

void Entity::setLayer(Qt3DRender::QLayer *layer)
{
    Q_ASSERT(layer);

    removeComponent(mLayer);
    addComponent(layer);

    mLayer = layer;
    emit layerChanged();
}

void Entity::setCamera(Qt3DRender::QCamera *camera)
{
    if (camera == mCamera) return;

    mCamera = camera;
    emit cameraChanged();
}
