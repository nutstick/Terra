#include "terraingenerator.h"

QString TerrainGenerator::typeToString(TerrainGenerator::Type type)
{
  switch (type)
  {
    case TerrainGenerator::Flat:
      return "flat";
    case TerrainGenerator::Dem:
      return "dem";
  }
  return QString();
}
