#ifndef MARKERENTITY_H
#define MARKERENTITY_H

#include "entity.h"

#include <Qt3DExtras/QCylinderMesh>
#include <Qt3DExtras/QConeMesh>
#include <Qt3DExtras/QPhongAlphaMaterial>
#include <Qt3DExtras/QPhongMaterial>
#include <QTransform>

class CameraController;

class Map;

class LineMesh;

class MarkerEntity : public Entity
{
    Q_OBJECT

    Q_PROPERTY(QVector3D position READ position WRITE setPosition NOTIFY positionChanged)
    Q_PROPERTY(float height READ height WRITE setHeight NOTIFY heightChanged)
    Q_PROPERTY(CameraController* cameraController READ cameraController WRITE setCameraController NOTIFY cameraControllerChanged)
    Q_PROPERTY(Map* map READ map WRITE setMap NOTIFY mapChanged)

public:
    MarkerEntity(Qt3DCore::QNode *parent = nullptr);

    QVector3D position() const {
        return mPosition;
    }
    float height() const {
        return mHeight;
    }
    CameraController* cameraController() const {
        return mCameraController;
    }
    Map* map() const {
        return mMap;
    }

    //! set position using 2D space then auto fill height from terrain
    void setPosition(QVector2D position);
    //! set position by given x, y, z
    void setPosition(QVector3D position);
    //! set height
    void setHeight(const float height);

    void setCamera(Qt3DRender::QCamera *camera) override;

    void setCameraController(CameraController* cameraController);

    void setMap(Map* map);

    Type type() const override;

signals:
    void positionChanged();
    void heightChanged();
    void cameraControllerChanged();
    void mapChanged();

private slots:
    void onCameraPositionChanged(const QVector3D &position);
    void onBasePlaneDimensionChanged();

private:
    void update();

    static float headRadius;
    static float headHeight;
    static float defaultHeight;

    QVector3D mPosition;
    float mHeight;
    //! [0]
    Qt3DExtras::QCylinderMesh *mHead;
    Qt3DCore::QTransform *mHeadTransform;
    Qt3DExtras::QPhongMaterial *mHeadMaterial;
    //! [1]
    Qt3DExtras::QConeMesh *mBottom;
    Qt3DCore::QTransform *mBottomTransform;
    Qt3DExtras::QPhongMaterial *mBottomMaterial;
    //! [2]
    LineMesh *mLine;
    Qt3DExtras::QPhongMaterial *mLineMaterial;

    CameraController* mCameraController;

    Map* mMap;
};

#endif // MARKERENTITY_H
