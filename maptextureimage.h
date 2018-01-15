#ifndef MAPTEXTUREIMAGE_H
#define MAPTEXTUREIMAGE_H

#include <Qt3DRender/QAbstractTextureImage>

class MapTextureGenerator;

class MapTextureImage : public Qt3DRender::QAbstractTextureImage
{
    Q_OBJECT
public:
    MapTextureImage(MapTextureGenerator* mapGen, const int x, const int y, const int z, Qt3DCore::QNode *parent = nullptr);
    MapTextureImage(const QImage& image, const int x, const int y, const int z, Qt3DCore::QNode *parent = nullptr);
    ~MapTextureImage();

    virtual Qt3DRender::QTextureImageDataGeneratorPtr dataGenerator() const override;

private slots:
    void onTileReady(int jobId, const QImage& img);

signals:
    void textureReady();

private:
    MapTextureGenerator* mapGen;
    int x, y, z;
    QString debugText;
    QImage img;
    int jobId;
    bool jobDone;
};

#endif // MAPTEXTUREIMAGE_H
