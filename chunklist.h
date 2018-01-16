#ifndef CHUNKLIST_H
#define CHUNKLIST_H

#include <QObject>

class Tile;

//! Element of a double-linked list
class ChunkListEntry : public QObject
{
public:
  ChunkListEntry(Tile* tile)
    : prev(nullptr)
    , next(nullptr)
    , chunk(tile)
  {
  }

  ChunkListEntry* prev;
  ChunkListEntry* next;

  Tile* chunk;   //!< TODO: shared pointer
};


//! double linked list of chunks.
//! does not own entries!
class ChunkList : public QObject
{
public:
  ChunkList();

  int trueCount() const;
  int count() const { return mCount; }

  ChunkListEntry* first() const { return mHead; }
  ChunkListEntry* last() const { return mTail; }
  bool isEmpty() const;

  void insertEntry(ChunkListEntry* entry, ChunkListEntry* next);

  void takeEntry(ChunkListEntry* entry);

  ChunkListEntry *takeFirst();

  ChunkListEntry *takeLast();

  void insertFirst(ChunkListEntry* entry);

private:
  ChunkListEntry* mHead;
  ChunkListEntry* mTail;
  int mCount;
};

#endif // CHUNKLIST_H
