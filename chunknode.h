#ifndef CHUNKNODE_H
#define CHUNKNODE_H


class ChunkNode
{
public:
    ChunkNode(int x, int y, int z, float error, ChunkNode* parent = nullptr);

    ~ChunkNode();

    bool ChunkNode::allChildChunksResident() const;

    int level() const;

    // TODO: Loading handle
    void ChunkNode::setLoading();

    // TODO: Input as Entity
    void ChunkNode::setLoaded();

private:
    int x, y, z;
    float error;

    ChunkNode* parent;
    ChunkNode* children[4];

    enum State {
        Skeleton,
        Loading,
        Loaded,
    };

    State state;
};

#endif // CHUNKNODE_H
