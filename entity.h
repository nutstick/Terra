#ifndef ENTITY_H
#define ENTITY_H

#include <Qt3DCore/QEntity>

class Entity : public Qt3DCore::QEntity
{
public:
    enum Type
    {
        Drone,
        Marker,
        Region,
    };

    Entity(Qt3DCore::QNode *parent = nullptr);

    virtual Type type() = 0;
};

#endif // ENTITY_H
