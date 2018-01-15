#include "chunkedentity.h"

ChunkedEntity::ChunkedEntity(Tile tile, Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , mTile(tile)
{
    int size = basePlaneDimesion / qPow(2, tile.z());
    // int vertices = 128;
    // int segments = vertices - 1;

    // create geometry renderer

    Qt3DRender::QMesh* mesh = new Qt3DRender::QMesh;
    Qt3DExtras::QPlaneGeometry* geometry = new Qt3DExtras::QPlaneGeometry(mesh);
    geometry->setWidth(size);
    geometry->setHeight(size);

    mesh->setGeometry(geometry);

    addComponent(mesh);  // takes ownership if the component has no parent

    // create material

    Qt3DRender::QTexture2D* texture = new Qt3DRender::QTexture2D(entity);
    MapTextureImage* image = new MapTextureImage(mTextureImage, mTile, mTileDebugText);
    texture->addTextureImage(image);
    texture->setMinificationFilter(Qt3DRender::QTexture2D::Linear);
    texture->setMagnificationFilter(Qt3DRender::QTexture2D::Linear);
    Qt3DExtras::QTextureMaterial* material;
    material = new Qt3DExtras::QTextureMaterial;
    material->setTexture(texture);

    entity->addComponent(material);  // takes ownership if the component has no parent

    // create transform

    Qt3DCore::QTransform* transform = new Qt3DCore::QTransform();
    addComponent(transform);

    // Move tile
    int xOffset = (x + 0.5) * size - basePlaneDimesion / 2;
    int yOffset = (y + 0.5) * size - basePlaneDimesion / 2;
    transform->setTranslation(QVector3D(xOffset, 0, yOffset));

    setEnabled(false);
}

