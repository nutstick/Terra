#include "map.h"

#include "flatterraingenerator.h"
#include "tile.h"
#include "chunklist.h"
#include "cameracontroller.h"
#include <QVector3D>

//#include <Qt3DRender/QCamera>
#include "mycamera.h"
#include "mapsettings.h"

static float screenSpaceError(float epsilon, float distance, float screenSize, float fov)
{
    /* This routine approximately calculates how an error (epsilon) of an object in world coordinates
    * at given distance (between camera and the object) will look like in screen coordinates.
    *
    * the math below simply uses triangle similarity:
    *
    *             epsilon                       phi
    *   -----------------------------  = ----------------
    *   [ frustum width at distance ]    [ screen width ]
    *
    * Then we solve for phi, substituting [frustum width at distance] = 2 * distance * tan(fov / 2)
    *
    *  ________xxx__      xxx = real world error (epsilon)
    *  \     |     /        x = screen space error (phi)
    *   \    |    /
    *    \___|_x_/   near plane (screen space)
    *     \  |  /
    *      \ | /
    *       \|/    angle = field of view
    *       camera
    */
    float phi = epsilon * screenSize / (2 * distance * tan( fov * M_PI / (2 * 180) ) );
    return phi;
}

static float screenSpaceError(Tile* tile, const CameraController* cameraController)
{
    float dist = tile->center3d().distanceToPoint(cameraController->camera()->position());

    // TODO: what to do when distance == 0 ?
    QRect rect = cameraController->viewport();
    int screenSizePx = qMax(rect.width(), rect.height());  // TODO: is this correct?

    float sse = screenSpaceError(tile->error, dist, screenSizePx, cameraController->camera()->fieldOfView());
    return sse;
}


#include <QVector4D>

//! coarse box vs frustum test for culling.
//! corners of oriented box are transformed to clip space and new axis-aligned box is created for intersection test
static bool isInFrustum(const QRect& rect, const QMatrix4x4& viewProjectionMatrix)
{
    float xmin, ymin, zmin, xmax, ymax, zmax;
    for (int i = 0; i < 8; ++i)
    {
        qDebug() << rect.top()<< rect.bottom();
        QVector4D p(((i >> 0) & 1) ? rect.bottom() : rect.top(),
                    ((i >> 1) & 1) ? rect.right() : rect.left(),
                    ((i >> 2) & 1) ? 0 : 0, 1);
        QVector4D pc = viewProjectionMatrix * p;
        pc /= pc.w();
        float x = pc.x(), y = pc.y(), z = pc.z();

        if (i == 0)
        {
            xmin = xmax = x;
            ymin = ymax = y;
            zmin = zmax = z;
        }
        else
        {
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
            if (z < zmin) zmin = z;
            if (z > zmax) zmax = z;
        }
    }

    return QRect(-1, -1, 2, 2).intersects(QRect(QPoint(xmin, ymin), QPoint(xmax, ymax)));
    // AABB(-1, -1, -1, 1, 1, 1).intersects(AABB(xmin, ymin, zmin, xmax, ymax, zmax));
}

Map::Map(Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , mTerrainGenerator(new FlatTerrainGenerator)
    , mLayer(new Qt3DRender::QLayer(this))
{
    mTerrainGenerator->setMap(this);
    rootTile = new Tile(0, 0, 0, /*TODO*/ 0.1f);

    chunkLoaderQueue = new ChunkList;
    replacementQueue = new ChunkList;

    loaderThread = new LoaderThread(chunkLoaderQueue, loaderMutex, loaderWaitCondition);
    connect(loaderThread, &LoaderThread::nodeLoaded, this, &Map::onNodeLoaded);
    loaderThread->start();

    addComponent(mLayer);
}

Map::~Map()
{
    loaderThread->setStopping(true);
    loaderWaitCondition.wakeOne();  // may be waiting
    loaderThread->wait();
    delete loaderThread;

    delete rootTile;

    delete mTerrainGenerator;
    delete mMapTextureGenerator;
}

void Map::setCameraController(CameraController *cameraController)
{
    mCameraController = cameraController;
    emit cameraControllerChanged();
}

void Map::setLayer(Qt3DRender::QLayer *layer)
{
    Q_ASSERT(layer);

    removeComponent(mLayer);
    addComponent(layer);

    mLayer = layer;
}

void Map::update()
{
    Q_ASSERT(mCameraController);

    QSet<Tile*> activeBefore = QSet<Tile*>::fromList(activeTiles);
    activeTiles.clear();
    frustumCulled = 0;

    update(rootTile);

    int enabled = 0, disabled = 0, unloaded = 0;

    Q_FOREACH (Tile* tile, activeTiles)
    {
        if (activeBefore.contains(tile))
            activeBefore.remove(tile);
        else
        {
            tile->entity->setEnabled(true);
            ++enabled;
        }
    }

    // disable those that were active but will not be anymore
    Q_FOREACH (Tile* tile, activeBefore)
    {
        tile->entity->setEnabled(false);
        ++disabled;
    }

    // unload those that are over the limit for replacement
    // TODO: what to do when our cache is too small and nodes are being constantly evicted + loaded again
    while (replacementQueue->count() > 512)
    {
        ChunkListEntry* entry = replacementQueue->takeLast();
        entry->chunk->unloadChunk();  // also deletes the entry
        ++unloaded;
    }

//    needsUpdate = false;  // just updated

//    qDebug() << "update: active " << activeTiles.count() << " enabled " << enabled << " disabled " << disabled << " | culled " << frustumCulled << " | loading " << chunkLoaderQueue->count() << " loaded " << replacementQueue->count() << " | unloaded " << unloaded;
}

void Map::update(Tile *tile)
{
    // TODO: fix and re-enable frustum culling
    if (0 && !isInFrustum(tile->rect(), mCameraController->camera()->projectionMatrix() * mCameraController->camera()->viewMatrix()))
    {
        ++frustumCulled;
        return;
    }

    tile->ensureAllChildrenExist();

    // make sure all nodes leading to children are always loaded
    // so that zooming out does not create issues
    requestResidency(tile);

    if (!tile->entity)
    {
        // this happens initially when root node is not ready yet
        // qDebug() << "Root tile not ready";
        return;
    }

    // qDebug() << tile->x() << "|" << tile->y() << "|" << tile->z() << "  " << mTau << "  " << screenSpaceError(tile, mCameraController);
    if (screenSpaceError(tile, mCameraController) <= mTau)
    {
        // acceptable error for the current chunk - let's render it

        activeTiles << tile;
    }
    else if (tile->allChildChunksResident())
    {
        // error is not acceptable and children are ready to be used - recursive descent

        for (int i = 0; i < 4; ++i)
            update(tile->children[i]);
    }
    else
    {
        // error is not acceptable but children are not ready either - still use parent but request children

        activeTiles << tile;

        if (tile->z() <= mMaxLevel)
        {
            for (int i = 0; i < 4; ++i)
                requestResidency(tile->children[i]);
        }
    }
}

void Map::requestResidency(Tile *tile)
{
    if (tile->state == Tile::Loaded)
    {
        // Q_ASSERT(tile->replacementQueueEntry);
        Q_ASSERT(tile->entity);
        replacementQueue->takeEntry(tile->replacementQueueEntry);
        replacementQueue->insertFirst(tile->replacementQueueEntry);
    }
    else if (tile->state == Tile::Loading)
    {
        // move to the front of loading queue
        loaderMutex.lock();
        Q_ASSERT(tile->loaderQueueEntry);
        Q_ASSERT(tile->loader);
        if (tile->loaderQueueEntry->prev || tile->loaderQueueEntry->next)
        {
            chunkLoaderQueue->takeEntry(tile->loaderQueueEntry);
            chunkLoaderQueue->insertFirst(tile->loaderQueueEntry);
        }
        else
        {
          // the entry is being currently processed by the loading thread
          // (or it is at the head of 1-entry list)
        }
        loaderMutex.unlock();
    }
    else if (tile->state == Tile::Skeleton)
    {
        // add to the loading queue
        loaderMutex.lock();
        ChunkListEntry* entry = new ChunkListEntry(tile);
        tile->setLoading(mTerrainGenerator->createChunkLoader(tile), entry);
        chunkLoaderQueue->insertFirst(entry);
        if (chunkLoaderQueue->count() == 1)
            loaderWaitCondition.wakeOne();
        loaderMutex.unlock();
    }
    else
        Q_ASSERT(false && "impossible!");
}

void Map::onNodeLoaded(Tile *tile)
{
    Qt3DCore::QEntity* entity = tile->loader->createEntity(this);

    loaderMutex.lock();
    ChunkListEntry* entry = tile->loaderQueueEntry;

    // load into node (should be in main thread again)
    tile->setLoaded(entity, entry);
    loaderMutex.unlock();

    replacementQueue->insertFirst(entry);

    // now we need an update!
    // needsUpdate = true;
}

QQmlListProperty<Entity> Map::entities()
{
    return QQmlListProperty<Entity>(this, this,
             &Map::appendEntity,
             &Map::entityCount,
             &Map::entity,
             &Map::clearEntities);
}

void Map::appendEntity(Entity* p) {
    mEntities.append(p);
}

int Map::entityCount() const
{
    return mEntities.count();
}

Entity* Map::entity(int index) const
{
    return mEntities.at(index);
}

void Map::clearEntities() {
    return mEntities.clear();
}


void Map::appendEntity(QQmlListProperty<Entity>* list, Entity* p) {
    reinterpret_cast< Map* >(list->data)->appendEntity(p);
}

void Map::clearEntities(QQmlListProperty<Entity>* list) {
    reinterpret_cast< Map* >(list->data)->clearEntities();
}

Entity* Map::entity(QQmlListProperty<Entity>* list, int i) {
    return reinterpret_cast< Map* >(list->data)->entity(i);
}

int Map::entityCount(QQmlListProperty<Entity>* list) {
    return reinterpret_cast< Map* >(list->data)->entityCount();
}

//! [0]

LoaderThread::LoaderThread(ChunkList *list, QMutex &mutex, QWaitCondition &waitCondition)
    : loadList(list)
    , mutex(mutex)
    , waitCondition(waitCondition)
    , stopping(false)
{
}

void LoaderThread::run()
{
    while (1)
    {
        ChunkListEntry* entry = nullptr;
        mutex.lock();
        if (loadList->isEmpty())
            waitCondition.wait(&mutex);

        // we can get woken up also when we need to stop
        if (stopping)
        {
            mutex.unlock();
            break;
        }

        Q_ASSERT(!loadList->isEmpty());
        entry = loadList->takeFirst();
        mutex.unlock();

        // qDebug() << "[THR] loading! " << entry->chunk->x() << " | " << entry->chunk->y() << " | " << entry->chunk->z();

        entry->chunk->loader->load();

        // qDebug() << "[THR] done!";

        emit nodeLoaded(entry->chunk);

        if (stopping)
        {
            // this chunk we just processed will not be processed anymore because we are shutting down everything
            // so at least put it back into the loader queue so that we can clean up the chunk
            loadList->insertFirst(entry);
        }
    }
}
