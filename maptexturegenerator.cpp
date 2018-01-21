#include "maptexturegenerator.h"

#include <QImage>
#include <QImageReader>
#include <QEventLoop>
#include <QPainter>

MapTextureGenerator::MapTextureGenerator(const Map &map)
    : map(map)
    , lastJobId(0)
{
}

MapTextureGenerator::~MapTextureGenerator()
{
    Q_FOREACH(const JobData& jd, jobs)
    {
        jd.reply->abort();
        jd.reply->deleteLater();
        jobs.remove(jd.reply);
    }
}

int MapTextureGenerator::render(const int x, const int y, const int z)
{
    QNetworkAccessManager* nam = new QNetworkAccessManager;
    connect(nam, &QNetworkAccessManager::finished, this, &MapTextureGenerator::onRenderingFinished);

    QUrl url = baseUrl(x, y, z);

    QNetworkRequest request(url);
    QNetworkReply *reply = nam->get(request);

    JobData jobData;
    jobData.jobId = ++lastJobId;
    jobData.reply = reply;
    jobData.nam = nam;

    jobs.insert(reply, jobData);

    return jobData.jobId;
}

void MapTextureGenerator::cancelJob(int jobId)
{
    Q_FOREACH(const JobData& jd, jobs)
    {
        if (jd.jobId == jobId)
        {
            jd.reply->abort();
            disconnect(jd.nam, &QNetworkAccessManager::finished, this, &MapTextureGenerator::onRenderingFinished);
            jd.reply->deleteLater();
            jobs.remove(jd.reply);
            return;
        }
    }
    Q_ASSERT(false && "requested job ID does not exist!");
}

QImage MapTextureGenerator::renderSynchronously(const int x, const int y, const int z)
{
    qDebug() << "MapText renderSync";
    QNetworkAccessManager* nam = new QNetworkAccessManager;
    QEventLoop loop;

    connect(nam, &QNetworkAccessManager::finished, &loop, &QEventLoop::quit);

    QUrl url = baseUrl(x, y, z);

    QNetworkRequest request(url);
    QNetworkReply *reply = nam->get(request);

    loop.exec();

    QImage img;
    if (reply->error() != QNetworkReply::OperationCanceledError)
    {
        // Did the reply return with errors...
        if(reply->error() != QNetworkReply::NoError)
        {
            qDebug() << "Failed to download" << reply->url() << "with error" << reply->errorString();
            return img;
        }
        else
        {
            qDebug() << "Downloaded image" << reply->url().toString();
            QImageReader render(reply);
            img = render.read();
        }
    }

    // extra tile information for debugging
    QPainter p(&img);
    p.setPen(Qt::white);
    p.drawRect(0,0,img.width()-1, img.height()-1);
    QString debugText("%1/%2/%3");
    p.drawText(img.rect(), debugText.arg(x).arg(y).arg(z), QTextOption(Qt::AlignCenter));
    p.end();

    return img;
}

void MapTextureGenerator::onRenderingFinished(QNetworkReply* reply)
{
    Q_ASSERT(reply);
    Q_ASSERT(jobs.contains(reply));
    JobData jobData = jobs.value(reply);

    // Read image from reply
    QImage img;
    if (reply->error() != QNetworkReply::OperationCanceledError)
    {
        // Did the reply return with errors...
        if(reply->error() != QNetworkReply::NoError)
        {
            qDebug() << "Failed to download" << reply->url() << "with error" << reply->errorString();
        }
        else
        {
            qDebug() << "Downloaded image" << reply->url().toString();
            QImageReader render(reply);
            img = render.read();
        }
    }

    reply->deleteLater();
    jobs.remove(reply);

    //qDebug() << "finished job " << jobData.jobId << "  ... in queue: " << jobs.count();

    // pass QImage further
    emit tileReady(jobData.jobId, img);
}

QUrl MapTextureGenerator::baseUrl(const int x, const int y, const int z)
{
  QString url = QString("https://api.mapbox.com/v4/mapbox.satellite/%1/%2/%3.png?access_token=pk.eyJ1IjoibnV0c3RpY2siLCJhIjoiY2o4aTh1anUxMTB2bTJ3bDlqYmo5ODJvaSJ9.YN8ymbV5tq9XsSHGflhblw")
          .arg(z).arg(x).arg(y);
  return QUrl(url);
}
