#include "tile.h"

Tile::Tile()
    : mX(0)
    , mY(0)
    , mZ(0)
{
}

Tile::Tile(int x, int y, int z)
    : mX(x)
    , mY(y)
    , mZ(z)
{
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
