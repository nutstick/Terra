#ifndef MARKERENTITY_H
#define MARKERENTITY_H

#include "entity.h"

#include <Qt3DExtras/QCylinderMesh>
#include <Qt3DExtras/QConeMesh>
#include <Qt3DExtras/QPhongAlphaMaterial>
#include <Qt3DExtras/QPhongMaterial>
#include <QTransform>

class MarkerEntity : public Entity
{
    Q_OBJECT

    Q_PROPERTY(QVector3D position READ position WRITE setPosition NOTIFY positionChanged)
    Q_PROPERTY(float height READ height WRITE setHeight NOTIFY heightChanged)

public:
    MarkerEntity(Qt3DCore::QNode *parent = nullptr);

    QVector3D position() const {
        return mPosition;
    }
    float height() const {
        return mHeight;
    }

    //! set position using 2D space then auto fill height from terrain
    void setPosition(QVector2D position);
    //! set position by given x, y, z
    void setPosition(QVector3D position);
    //! set height
    void setHeight(const float height);

    void setCamera(Qt3DRender::QCamera *camera) override;

    Type type() const override;

signals:
    void positionChanged();
    void heightChanged();

private slots:
    void onCameraPositionChanged(const QVector3D &position);

private:
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
};

#endif // MARKERENTITY_H
