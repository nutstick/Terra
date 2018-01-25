#ifndef TILE_H
#define TILE_H

#include <QObject>

class ChunkLoader;
class ChunkListEntry;
namespace Qt3DCore
{
  class QEntity;
}
class QRect;
class QPoint;
class QVector3D;

class Tile : public QObject
{
public:
    Tile();
    Tile(int x, int y, int z, float error, Tile* parent = nullptr);
    ~Tile();

    int x() const;
    int y() const;
    int z() const;
    void setX(const int x);
    void setY(const int y);
    void setZ(const int z);

    QPoint center() const;
    QVector3D center3d() const;
    QRect rect() const;

    bool allChildChunksResident() const;

    //! make sure that all child nodes are at least skeleton nodes
    void ensureAllChildrenExist();

    //! mark a chunk as being loaded, using the passed loader
    void setLoading(ChunkLoader* chunkLoader, ChunkListEntry* entry);

    //! mark a chunk as loaded, using the loaded entity
    void setLoaded(Qt3DCore::QEntity* entity, ChunkListEntry* entry);

    //! turn a loaded chunk into skeleton
    void unloadChunk();

    Tile* parent;
    Tile* children[4];

    enum State
    {
        Skeleton,
        Loading,
        Loaded,
    };

    State state;

    ChunkListEntry* loaderQueueEntry;  //!< not null <=> Loading state
    ChunkListEntry* replacementQueueEntry;  //!< not null <=> Loaded state

    Qt3DCore::QEntity* entity;
    ChunkLoader* loader;

    float error;

private:
    int mX, mY, mZ;

};

#endif // TILE_H
