#ifndef LINEMESHGEOMETRY_H
#define LINEMESHGEOMETRY_H

#include <Qt3DRender/QGeometry>
#include <Qt3DRender/QBuffer>
#include <Qt3DRender/QAttribute>
#include <QList>
#include <QVector4D>
#include <QVector3D>

class LineMeshGeometry : public Qt3DRender::QGeometry
{
public:
    LineMeshGeometry(QList<QVector4D> vertices, Qt3DCore::QNode *parent = nullptr);

    void setVertices(QList<QVector4D> vertices);

    int vertexCount();

private:
    QList<QVector3D> mVertices;
    Qt3DRender::QAttribute* mPositionAttribute;
    Qt3DRender::QBuffer* mVertexBuffer;
};

#endif // LINEMESHGEOMETRY_H
