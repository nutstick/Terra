#include "polylineentity.h"

#include "markerentity.h"

PolylineEntity::PolylineEntity(Qt3DCore::QNode *parent)
    : Entity(parent)
    , mMarkers()
{
}

Entity::Type PolylineEntity::type() const
{
    return Entity::Polyline;
}

MarkerEntity* PolylineEntity::addMarker(QVector3D position)
{
    MarkerEntity *marker = new MarkerEntity(this);
    marker->setPosition(position);
    mMarkers.append(marker);
    return marker;
}
