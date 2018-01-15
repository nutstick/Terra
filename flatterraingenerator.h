#ifndef FLATTERRAINGENERATOR_H
#define FLATTERRAINGENERATOR_H

#include "terraingenerator.h"

#include "chunkloader.h"

namespace Qt3DExtras
{
  class QPlaneGeometry;
}

class FlatTerrainGenerator : public TerrainGenerator
{
public:
    FlatTerrainGenerator();

    virtual ChunkLoader *createChunkLoader(Tile *tile) const override;

    Type type() const override;

private:
  Qt3DExtras::QPlaneGeometry* tileGeometry;

  void updateTilingScheme();
};

#endif // FLATTERRAINGENERATOR_H
