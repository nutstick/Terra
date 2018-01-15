#ifndef TERRAINGENERATOR_H
#define TERRAINGENERATOR_H

#include "chunkloader.h"

class Map;

class TerrainGenerator : public ChunkLoaderFactory
{
public:
    enum Type
    {
        Flat,
        Dem,
    };

    virtual ~TerrainGenerator();

    void setMap(Map* map) { mMap = map; }

    //! What texture generator implementation is this
    virtual Type type() const = 0;

    static QString typeToString(Type type);

    Map* mMap = nullptr;
};

#endif // TERRAINGENERATOR_H
