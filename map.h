#ifndef MAP_H
#define MAP_H

#include <memory>

class MapTextureGenerator;
class TerrainGenerator;

class Map
{
public:
    Map();

    ~Map();

    MapTextureGenerator* mapTextureGenerator() { return mMapTextureGenerator; }
    std::unique_ptr<TerrainGenerator> terrainGenerator;

private:
    MapTextureGenerator* mMapTextureGenerator;
};

#endif // MAP_H
