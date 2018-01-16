#include "terrainchunkloader.h"

#include "map.h"
#include "maptextureimage.h"
#include "maptexturegenerator.h"

#include <Qt3DRender/QTexture>
#include <Qt3DExtras/QTextureMaterial>

TerrainChunkLoader::TerrainChunkLoader(Map* map, Tile *tile)
    : ChunkLoader(tile)
    , mMap(map)
{
}

void TerrainChunkLoader::loadTexture()
{
    mTextureImage = mMap->mapTextureGenerator()->renderSynchronously(tile->x(), tile->y(), tile->z());
}

void TerrainChunkLoader::createTextureComponent(Qt3DCore::QEntity *entity)
{
    Qt3DRender::QTexture2D* texture = new Qt3DRender::QTexture2D(entity);
    MapTextureImage* image = new MapTextureImage(mTextureImage, tile->x(), tile->y(), tile->z());
    texture->addTextureImage(image);
    texture->setMinificationFilter(Qt3DRender::QTexture2D::Linear);
    texture->setMagnificationFilter(Qt3DRender::QTexture2D::Linear);

    Qt3DExtras::QTextureMaterial* material;
    material = new Qt3DExtras::QTextureMaterial;
    material->setTexture(texture);

    entity->addComponent(material);  // takes ownership if the component has no parent
}
