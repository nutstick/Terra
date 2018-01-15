#ifndef TILE_H
#define TILE_H

class ChunkLoader;

class Tile
{
public:
    Tile();
    Tile(int x, int y, int z);

    int x() const;
    int y() const;
    int z() const;
    void setX(const int x);
    void setY(const int y);
    void setZ(const int z);

private:
    int mX, mY, mZ;

    Tile* parent;
    Tile* children[4];

    enum State
    {
        Skeleton,
        Loading,
        Loaded,
    };

    State state;

    ChunkLoader* loader;
};

#endif // TILE_H
