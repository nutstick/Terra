#ifndef ENTITY_H
#define ENTITY_H

#include <Qt3DCore/QEntity>
#include <Qt3DRender/QLayer>
#include <Qt3DRender/QCamera>

class Entity : public Qt3DCore::QEntity
{
    Q_OBJECT

    Q_PROPERTY(Qt3DRender::QLayer* layer READ layer WRITE setLayer NOTIFY layerChanged)
    Q_PROPERTY(Qt3DRender::QCamera* camera READ camera WRITE setCamera NOTIFY cameraChanged)

public:
    enum Type
    {
        Drone,
        Marker,
        Region,
        Polyline,
    };

    Entity(Qt3DCore::QNode *parent = nullptr);

    Qt3DRender::QLayer* layer() const {
        return mLayer;
    }
    Qt3DRender::QCamera* camera() const {
        return mCamera;
    }

    void setLayer(Qt3DRender::QLayer* layer);
    virtual void setCamera(Qt3DRender::QCamera *camera);

signals:
    void layerChanged();
    void cameraChanged();

    virtual Type type() const = 0;

protected:
    Qt3DRender::QCamera *mCamera;

private:
    Qt3DRender::QLayer* mLayer;
};

#endif // ENTITY_H
