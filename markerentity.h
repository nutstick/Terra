#ifndef MARKERENTITY_H
#define MARKERENTITY_H

#include "entity.h"

#include <Qt3DRender/QObjectPicker>
#include <Qt3DRender/QPickTriangleEvent>
#include <Qt3DExtras/QCylinderMesh>
#include <Qt3DExtras/QConeMesh>
#include <Qt3DExtras/QPhongAlphaMaterial>
#include <Qt3DExtras/QPhongMaterial>
#include <QTransform>
#include <QGeoCoordinate>

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

    //! set position by given x, y, z
    void setPosition(QVector3D position);
    //! set position by given x, y, z
    void setPosition(QGeoCoordinate coord);
    //! set height
    void setHeight(const float height);
    //! set camera
    void setCamera(Qt3DRender::QCamera *camera) override;
    //! set camera controller
    void setCameraController(CameraController* cameraController);
    //! set map
    void setMap(Map* map);
    //! type definition
    Type type() const override;

    bool rayOBBIntersection(QVector3D rayOrigin, QVector3D rayDirection, float& distance);

signals:
    void positionChanged();
    void heightChanged();
    void cameraControllerChanged();
    void mapChanged();

private slots:
    void onCameraPositionChanged(const QVector3D &position);
    void onMousePressed(Qt3DRender::QPickEvent *pick);

private:
    //! Update position after set position and height
    void update();

    //! Geometry settings
    static float headRadius;
    static float headHeight;
    static float defaultHeight;

    //! Main property
    QVector3D mPosition;
    float mHeight;

    //! Marker's head components
    Qt3DExtras::QCylinderMesh *mHead;
    Qt3DCore::QTransform *mHeadTransform;
    Qt3DExtras::QPhongMaterial *mHeadMaterial;
    //! Marker's bottom components
    Qt3DExtras::QConeMesh *mBottom;
    Qt3DCore::QTransform *mBottomTransform;
    Qt3DExtras::QPhongMaterial *mBottomMaterial;
    //! Line between head and bottom
    LineMesh *mLine;
    Qt3DExtras::QPhongMaterial *mLineMaterial;
    //! Camera controller
    CameraController* mCameraController;
    //! Map
    Map* mMap;
};

#endif // MARKERENTITY_H
