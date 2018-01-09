#include "terraindatagenerator.h"

#include <QNetworkReply>
#include <QImage>
#include <QImageReader>

TerrainDataGenerator::TerrainDataGenerator(QObject *parent)
    : QObject(parent)
{
}

TerrainDataGenerator::~TerrainDataGenerator()
{
    Q_FOREACH(const JobData& jd, jobs)
    {
        jd.reply->abort();
        jd.reply->deleteLater();
        jobs.remove(jd.reply);
    }
}

QString TerrainDataGenerator::render(const QString url)
{
  QNetworkAccessManager* nam = new QNetworkAccessManager;
  connect(nam, &QNetworkAccessManager::finished, this, &TerrainDataGenerator::onRenderingFinished);

  QNetworkRequest request(url);
  QNetworkReply *reply = nam->get(request);

  JobData jobData;
  jobData.url = url;
  jobData.reply = reply;
  jobData.nam = nam;

  jobs.insert(reply, jobData);

  return jobData.url;
}

void TerrainDataGenerator::onRenderingFinished(QNetworkReply* reply)
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

  /* QList<
  for (int row = 0; row < img.height(); ++row)
  {
      for (int col = 0; col < img.width(); ++col)
      {
          QColor cl(img.pixel(row, col));

          float height = -1000.0 + ((cl.redF() * 256.0 * 256.0 + cl.greenF() * 256.0 + cl.blueF()) * 0.1);
          heightMap.push_back(height);
      }
  } */

  reply->deleteLater();
  jobs.remove(reply);

  //qDebug() << "finished job " << jobData.jobId << "  ... in queue: " << jobs.count();

  // pass QImage further
  emit tileReady(jobData.url, NULL);
}
