#ifndef CHUNKEDENTITY_H
#define CHUNKEDENTITY_H

#include <Qt3DCore/QEntity>

class Tile;
class ChunkLoaderFactory;
class LoaderThread;

class ChunkedEntity : public Qt3DCore::QEntity
{
    Q_OBJECT

    // Q_PROPERTY(Tile tile READ tile WRITE setTile NOTIFY tileChanged)

public:
    ChunkedEntity(ChunkLoaderFactory* loaderFactory, Qt3DCore::QNode* parent = nullptr);
    // ChunkedEntity(Tile tile, Qt3DCore::QNode* parent = nullptr);
    ~ChunkedEntity();

    // Tile tile() const;
    // void setTile(const Tile tile);

public slots:
    // void tileChanged();

private:
    // Tile* tile;
};

#endif // CHUNKEDENTITY_H