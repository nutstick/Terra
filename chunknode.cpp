#include "chunknode.h"

ChunkNode::ChunkNode(int x, int y, int z, float error, ChunkNode *parent)
    : x(x)
    , y(y)
    , z(z)
    , error(error)
    , parent(parent)
    , state(Skeleton)
{
    for (int i = 0; i < 4; ++i)
        children[i] = nullptr;
}

ChunkNode::~ChunkNode()
{
  Q_ASSERT(state == Skeleton);
  for (int i = 0; i < 4; ++i)
    delete children[i];
}

bool ChunkNode::allChildChunksResident() const {
    for (int i = 0; i < 4; ++i)
    {
        if (!children[i])
            return false;  // not even a skeleton
        if (children[i]->state != Loaded)
            return false;  // no there yet
    }
    return true;
}

void ChunkNode::ensureAllChildrenExist()
{
    float childError = error/2;
    float xc = bbox.xCenter(), zc = bbox.zCenter();
    float ymin = bbox.yMin;
    float ymax = bbox.yMax;

    if (!children[0])
        children[0] = new ChunkNode(x*2+0, y*2+1, z+1, childError, this);

    if (!children[1])
        children[1] = new ChunkNode(x*2+0, y*2+0, z+1, childError, this);

    if (!children[2])
        children[2] = new ChunkNode(x*2+1, y*2+1, z+1, childError, this);

    if (!children[3])
        children[3] = new ChunkNode(x*2+1, y*2+0, z+1, childError, this);
}

int ChunkNode::level() const
{
    int lvl = 0;
    ChunkNode* p = parent;
    while (p)
    {
        ++lvl;
        p = p->parent;
    }
    return lvl;
}

void ChunkNode::setLoading()
{
    this->state = Loading;
}

void ChunkNode::setLoaded()
{
    this->state = Loaded;
}
