#ifndef MAP_H
#define MAP_H

#include <memory>
#include <Qt3DCore/QEntity>
#include <QList>
#include <QMutex>
#include <QWaitCondition>

class MapTextureGenerator;
class TerrainGenerator;
class Tile;
class ChunkLoaderFactory;
class ChunkList;
class LoaderThread;

namespace Qt3DRender {
    class QCamera;
}

class Map : public Qt3DCore::QEntity
{
    Q_OBJECT

    Q_PROPERTY(Qt3DRender::QCamera *camera READ camera WRITE setCamera NOTIFY cameraChanged)
    Q_PROPERTY(float tau READ tau WRITE setTau NOTIFY tauChanged)
    Q_PROPERTY(int maxLevel READ maxLevel WRITE setMaxLevel NOTIFY maxLevelChanged)

public:
    Map(Qt3DCore::QNode *parent = nullptr);
    ~Map();

    void update();

    //! make sure that the chunk will be loaded soon (if not loaded yet) and not unloaded anytime soon (if loaded already)
    void requestResidency(Tile* tile);

    Qt3DRender::QCamera *camera() const { return mCamera; }
    float tau() const { return mTau; }
    int maxLevel() const { return mMaxLevel; }
    MapTextureGenerator* mapTextureGenerator() const { return mMapTextureGenerator; }
    TerrainGenerator* terrainGenerator() const { return mTerrainGenerator; }

    void setCamera(const Qt3DRender::QCamera *camera);
    void setTau(const float tau);
    void setMaxLevel(const int maxLevel);

signals:
    void cameraChanged();
    void tauChanged();
    void maxLevelChanged();

private:
    void update(Tile* tile);

private slots:
  void onNodeLoaded(Tile* tile);

private:
    Qt3DRender::QCamera* mCamera;

    MapTextureGenerator* mMapTextureGenerator;
    TerrainGenerator* mTerrainGenerator;

    Tile* rootTile;
    //! max. allowed screen space error
    float mTau;
    //! maximum allowed depth of quad tree
    int mMaxLevel;
    //! queue of chunks to be loaded
    ChunkList* chunkLoaderQueue;
    //! queue of chunk to be eventually replaced
    ChunkList* replacementQueue;

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
