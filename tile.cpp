#include "tile.h"

#include <Qt3DCore/QEntity>
#include <QRect>
#include <QtMath>
#include <QVector3D>
#include "mapsettings.h"

Tile::Tile()
    : parent(nullptr)
    , state(Skeleton)
    , error(0.1) // TODO:
    , mX(0)
    , mY(0)
    , mZ(0)
{
}

Tile::Tile(int x, int y, int z, float error, Tile *parent)
    : parent(parent)
    , state(Skeleton)
    , loaderQueueEntry(nullptr)
    , replacementQueueEntry(nullptr)
    , entity(nullptr)
    , loader(nullptr)
    , error(error)
    , mX(x)
    , mY(y)
    , mZ(z)
{
    for (int i = 0; i < 4; ++i)
        children[i] = nullptr;
}

Tile::~Tile()
{
//    Q_ASSERT(!loader);   // should be deleted when removed from loader queue
//    Q_ASSERT(!entity);   // should be deleted when removed from replacement queue
    for (int i = 0; i < 4; ++i)
        delete children[i];
}

int Tile::x() const
{
    return mX;
}

int Tile::y() const
{
    return mY;
}

int Tile::z() const
{
    return mZ;
}

void Tile::setX(const int x)
{
    if (mX == x)
        return;
    mX = x;
}

void Tile::setY(const int y)
{
    if (mY == y)
        return;
    mY = y;
}

void Tile::setZ(const int z)
{
    if (mZ == z)
        return;
    mZ = z;
}

QPoint Tile::center() const
{
    float size = MapSettings::basePlaneDimension() / qPow(2, mZ);
    float xOffset = (mX + 0.5) * size - MapSettings::basePlaneDimension() / 2;
    float yOffset = (mY + 0.5) * size - MapSettings::basePlaneDimension() / 2;
    return QPoint(xOffset, yOffset);
}

QVector3D Tile::center3d() const
{
    QPoint c = center();
    return QVector3D(c.x(), 0, c.y());
}

QRect Tile::rect() const
{
    float size = MapSettings::basePlaneDimension() / qPow(2, mZ);
    QPoint c = center();
    return QRect(c - QPoint(size / 2, size / 2), QSize(size, size));
}

bool Tile::allChildChunksResident() const
{
    for (int i = 0; i < 4; ++i)
    {
        if (!children[i])
            return false;  // not even a skeleton
        if (children[i]->state != Loaded)
            return false;  // no there yet
        //if (children[i]->entityCreatedTime.msecsTo(currentTime) < 100)
        //  return false;  // allow some time for upload of stuff within Qt3D (TODO: better way to check it is ready?)
    }
    return true;
}

void Tile::ensureAllChildrenExist()
{
    float childError = error / 2;

    if (!children[0])
        children[0] = new Tile(mX*2+0, mY*2+1, mZ+1, childError, this);

    if (!children[1])
        children[1] = new Tile(mX*2+0, mY*2+0, mZ+1, childError, this);

    if (!children[2])
        children[2] = new Tile(mX*2+1, mY*2+1, mZ+1, childError, this);

    if (!children[3])
        children[3] = new Tile(mX*2+1, mY*2+0, mZ+1, childError, this);
}

void Tile::setLoading(ChunkLoader *chunkLoader, ChunkListEntry *entry)
{
    Q_ASSERT(!loaderQueueEntry);
    Q_ASSERT(!loader);

    state = Tile::Loading;
    loader = chunkLoader;
    loaderQueueEntry = entry;
}

void Tile::setLoaded(Qt3DCore::QEntity *newEntity, ChunkListEntry *entry)
{
    Q_ASSERT(state == Tile::Loading);
    Q_ASSERT(loader);

    entity = newEntity;

    delete loader;
    loader = nullptr;

    state = Tile::Loaded;
    loaderQueueEntry = nullptr;
    replacementQueueEntry = entry;
}

void Tile::unloadChunk()
{
    Q_ASSERT(state == Tile::Loaded);
    Q_ASSERT(entity);
    Q_ASSERT(replacementQueueEntry);

    entity->deleteLater();
    entity = nullptr;
    delete replacementQueueEntry;
    replacementQueueEntry = nullptr;
    state = Tile::Skeleton;
}
