#ifndef TERRAINDATAGENERATOR_H
#define TERRAINDATAGENERATOR_H

#include <QObject>
#include <QNetworkAccessManager>

class TerrainDataGenerator : public QObject
{
    Q_OBJECT
public:
    explicit TerrainDataGenerator(QObject *parent = nullptr);

    ~TerrainDataGenerator();

    Q_INVOKABLE QString render(const QString url);

signals:
    void tileReady(QString url, QByteArray pixel);

private slots:
    void onRenderingFinished(QNetworkReply* reply);

private:
    struct JobData
    {
        QString url;
        QNetworkReply* reply;
        QNetworkAccessManager* nam;
    };

    QHash<QNetworkReply*, JobData> jobs;
};

#endif // TERRAINDATAGENERATOR_H
