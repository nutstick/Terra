#include "flatterraingenerator.h"

#include <Qt3DCore/QEntity>
#include <Qt3DCore/QTransform>
#include <Qt3DRender/QGeometryRenderer>
#include <Qt3DExtras/QPlaneGeometry>

#include "map.h"

#include "tile.h"
#include "terrainchunkloader.h"

class FlatTerrainChunkLoader : public TerrainChunkLoader
{
public:
    FlatTerrainChunkLoader(Map* map, Qt3DExtras::QPlaneGeometry *tileGeometry, Tile* tile);

    virtual void load() override;
    virtual Qt3DCore::QEntity* createEntity(Qt3DCore::QEntity* parent) override;

private:
    Qt3DExtras::QPlaneGeometry *mTileGeometry;

    int const basePlaneDimesion = 65024;
};


FlatTerrainChunkLoader::FlatTerrainChunkLoader(Map *map, Qt3DExtras::QPlaneGeometry *tileGeometry, Tile *tile)
    : TerrainChunkLoader(map, tile)
    , mTileGeometry(tileGeometry)
{
}

void FlatTerrainChunkLoader::load()
{
    loadTexture();
}


Qt3DCore::QEntity *FlatTerrainChunkLoader::createEntity(Qt3DCore::QEntity *parent)
{
    Qt3DCore::QEntity* entity = new Qt3DCore::QEntity;

    // make geometry renderer

    Qt3DRender::QGeometryRenderer* mesh = new Qt3DRender::QGeometryRenderer;
    mesh->setGeometry(mTileGeometry);  // does not take ownership - geometry is already owned by FlatTerrain entity
    entity->addComponent(mesh);  // takes ownership if the component has no parent

    // create material

    createTextureComponent(entity);

    // create transform

    Qt3DCore::QTransform* transform;
    transform = new Qt3DCore::QTransform();
    entity->addComponent(transform);

    int size = basePlaneDimesion / qPow(2, tile.z());
    int xOffset = (x + 0.5) * size - basePlaneDimesion / 2;
    int yOffset = (y + 0.5) * size - basePlaneDimesion / 2;

    transform->setScale(size);
    transform->setTranslation(QVector3D(xOffset, 0, yOffset));

    entity->setEnabled(false);
    entity->setParent(parent);
    return entity;
}

// ---------------

FlatTerrainGenerator::FlatTerrainGenerator()
{
    // simple quad geometry shared by all tiles
    // QPlaneGeometry by default is 1x1 with mesh resultion QSize(2,2), centered at 0
    tileGeometry = new Qt3DExtras::QPlaneGeometry;  // TODO: parent to a node...
}

ChunkLoader *FlatTerrainGenerator::createChunkLoader(Tile *tile) const
{
    return new FlatTerrainChunkLoader(mMap, tileGeometry, tile);
}

TerrainGenerator::Type FlatTerrainGenerator::type() const
{
  return TerrainGenerator::Flat;
}
