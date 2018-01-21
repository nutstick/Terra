#ifndef MAPTEXTUREGENERATOR_H
#define MAPTEXTUREGENERATOR_H

#include <QObject>
#include <QUrl>
#include <QNetworkReply>

#include "tile.h"

class Map;

class MapTextureGenerator : public QObject
{
    Q_OBJECT

public:
    MapTextureGenerator(const Map& map);
    ~MapTextureGenerator();

    int render(const int x, const int y, const int z);

    void cancelJob(int jobId);

    QImage renderSynchronously(const int x, const int y, const int z);

signals:
    void tileReady(int jobId, const QImage& image);

private slots:
    void onRenderingFinished(QNetworkReply* reply);

private:
    QUrl baseUrl(const int x, const int y, const int z);

    const Map& map;

    struct JobData
    {
        int jobId;
        QNetworkReply* reply;
        QNetworkAccessManager* nam;
    };

    QHash<QNetworkReply*, JobData> jobs;
    int lastJobId;
};

#endif // MAPTEXTUREGENERATOR_H
