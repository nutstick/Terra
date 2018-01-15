#ifndef TERRAINCHUNKLOADER_H
#define TERRAINCHUNKLOADER_H

#include <chunkloader.h>

#include <QImage>

class Map;

class TerrainChunkLoader : public ChunkLoader
{
public:
    TerrainChunkLoader(Map* map, Tile* tile);

    void loadTexture();
    void createTextureComponent(Qt3DCore::QEntity* entity);

protected:
    Map* mMap;

private:
    QImage mTextureImage;
};

#endif // TERRAINCHUNKLOADER_H
