#ifndef MAPSETTINGS_H
#define MAPSETTINGS_H

#include <math.h>

class MapSettings
{
public:
    static float basePlaneDimension() {
        return 65024.0f * constainScale();
//        return 65.0 * (1 << 17);
    }

    static float tau() {
        return 2.0; // constainScale();
    }

    static int maxLevel() {
        return 22;
    }

    static float cameraDistance() {
        return 12000.0f;// * constainScale();
    }

    static int constainScale() {
        return 1;
//        return 1 << 7;
    }
};

#endif // MAPSETTINGS_H
