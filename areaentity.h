#ifndef AREAENTITY_H
#define AREAENTITY_H

#include "entity.h"

class Marker;

class AreaEntity : public Entity
{
public:
    AreaEntity(Qt3DCore::QNode *parent);

private:
    QList<Marker> mMarkers;
};

#endif // AREAENTITY_H
