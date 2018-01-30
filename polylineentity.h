#ifndef POLYLINEENTITY_H
#define POLYLINEENTITY_H

#include "entity.h"

class MarkerEntity;
class QVector3D;

class PolylineEntity : public Entity
{
    Q_OBJECT

public:
    PolylineEntity(Qt3DCore::QNode *parent = nullptr);

    Type type() const override;

    MarkerEntity* addMarker(QVector3D position);

private:
    QList<MarkerEntity*> mMarkers;
};

#endif // POLYLINEENTITY_H
