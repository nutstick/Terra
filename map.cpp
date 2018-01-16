#include "map.h"

#include "flatterraingenerator.h"
#include "tile.h"
#include "chunklist.h"
#include <Qt3DRender/QCamera>

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

static float screenSpaceError(Tile* tile, const Qt3DRender::QCamera* camera)
{
    float dist = node->bbox.distanceFromPoint(camera->position());

    // TODO: what to do when distance == 0 ?

    float sse = screenSpaceError(tile->error, dist, state.screenSizePx, camera->fieldOfView());
    return sse;
}


#include <QVector4D>

//! coarse box vs frustum test for culling.
//! corners of oriented box are transformed to clip space and new axis-aligned box is created for intersection test
static bool isInFrustum(const AABB& bbox, const QMatrix4x4& viewProjectionMatrix)
{
    float xmin, ymin, zmin, xmax, ymax, zmax;
    for (int i = 0; i < 8; ++i)
    {
        QVector4D p(((i >> 0) & 1) ? bbox.xMin : bbox.xMax,
                    ((i >> 1) & 1) ? bbox.yMin : bbox.yMax,
                    ((i >> 2) & 1) ? bbox.zMin : bbox.zMax, 1);
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
    return AABB(-1, -1, -1, 1, 1, 1).intersects(AABB(xmin, ymin, zmin, xmax, ymax, zmax));
}

Map::Map(Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , mTerrainGenerator(new FlatTerrainGenerator)
{
    rootTile = new Tile(0, 0, 0, /*TODO*/ 0.1);

    loaderThread = new LoaderThread(chunkLoaderQueue, loaderMutex, loaderWaitCondition);
    connect(loaderThread, &LoaderThread::nodeLoaded, this, &Map::onNodeLoaded);
    loaderThread->start();
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


void Map::update()
{
    Q_ASSERT(mCamera);

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

    qDebug() << "update: active " << activeTiles.count() << " enabled " << enabled << " disabled " << disabled << " | culled " << frustumCulled << " | loading " << chunkLoaderQueue->count() << " loaded " << replacementQueue->count() << " | unloaded " << unloaded;
}

void Map::update(Tile *tile)
{
    // TODO: fix and re-enable frustum culling
    if (0 && !isInFrustum(tile->rect(), mCamera->viewMatrix()))
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
        qDebug() << "Root tile not ready";
        return;
    }

    //qDebug() << node->x << "|" << node->y << "|" << node->z << "  " << tau << "  " << screenSpaceError(node, state);

    if (screenSpaceError(tile, mCamera) <= tau())
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
