#ifndef MAP_H
#define MAP_H

#include <QQmlListProperty>
#include <QVector>
#include <memory>
#include <Qt3DCore/QEntity>
#include <Qt3DRender/QLayer>
#include <QList>
#include <QMutex>
#include <QWaitCondition>

#include "entity.h"

class MapTextureGenerator;
class TerrainGenerator;
class Tile;
class ChunkLoaderFactory;
class ChunkList;
class LoaderThread;
class CameraController;

class Map : public Qt3DCore::QEntity
{
    Q_OBJECT

    Q_PROPERTY(CameraController *cameraController READ cameraController WRITE setCameraController NOTIFY cameraControllerChanged)
    Q_PROPERTY(Qt3DRender::QLayer* layer READ layer WRITE setLayer NOTIFY layerChanged)
    Q_PROPERTY(QQmlListProperty<Entity> entities READ entities)

public:
    Map(Qt3DCore::QNode *parent = nullptr);
    ~Map();

    Q_INVOKABLE void update();

    //! make sure that the chunk will be loaded soon (if not loaded yet) and not unloaded anytime soon (if loaded already)
    void requestResidency(Tile* tile);

    CameraController *cameraController() const { return mCameraController; }
    void setCameraController(CameraController *cameraController);

    Qt3DRender::QLayer* layer() const { return mLayer; }
    void setLayer(Qt3DRender::QLayer *layer);

    MapTextureGenerator* mapTextureGenerator() const { return mMapTextureGenerator; }
    TerrainGenerator* terrainGenerator() const { return mTerrainGenerator; }

    QQmlListProperty<Entity> entities();
    void appendEntity(Entity*);
    int entityCount() const;
    Entity* entity(int) const;
    void clearEntities();

signals:
    void cameraControllerChanged();
    void layerChanged();

private:
    void update(Tile* tile);

private slots:
  void onNodeLoaded(Tile* tile);

private:
    static void appendEntity(QQmlListProperty<Entity>*, Entity*);
    static int entityCount(QQmlListProperty<Entity>*);
    static Entity* entity(QQmlListProperty<Entity>*, int);
    static void clearEntities(QQmlListProperty<Entity>*);

private:
    CameraController* mCameraController;

    MapTextureGenerator* mMapTextureGenerator;
    TerrainGenerator* mTerrainGenerator;

    QVector<Entity *> mEntities;

    Tile* rootTile;
    //! max. allowed screen space error
    float mTau;
    //! base plane dimesion
    float mBasePlaneDimesion;
    //! maximum allowed depth of quad tree
    int mMaxLevel;
    //! queue of chunks to be loaded
    ChunkList* chunkLoaderQueue;
    //! queue of chunk to be eventually replaced
    ChunkList* replacementQueue;
    //! Layer
    Qt3DRender::QLayer* mLayer;

    QList<Tile*> activeTiles;
    int frustumCulled;

    LoaderThread* loaderThread;
    QMutex loaderMutex;
    QWaitCondition loaderWaitCondition;
};

#include <QThread>

class LoaderThread : public QThread
{
  Q_OBJECT
public:
  LoaderThread(ChunkList* list, QMutex& mutex, QWaitCondition& waitCondition);

  void setStopping(bool stop) { stopping = stop; }

  void run() override;

signals:
  void nodeLoaded(Tile* node);

private:
  ChunkList* loadList;
  QMutex& mutex;
  QWaitCondition& waitCondition;
  bool stopping;
};

#endif // MAP_H
