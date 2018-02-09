#ifndef MAPSETTINGS_H
#define MAPSETTINGS_H

class MapSettings
{
public:
    static float basePlaneDimension() {
        return 650240.0f;
    }

    static float tau() {
        return 0.00008f;
    }

    static int maxLevel() {
        return 22;
    }
};

#endif // MAPSETTINGS_H
