#ifndef LINEMESH_H
#define LINEMESH_H

#include <Qt3DRender/QGeometryRenderer>

class LineMeshGeometry;

class LineMesh : public Qt3DRender::QGeometryRenderer
{
public:
    LineMesh(QList<QVector4D> vertices, Qt3DCore::QNode *parent = nullptr);

    void setVertices(QList<QVector4D> vertices);

private:
    LineMeshGeometry* mLineMeshGeo;
};

#endif // LINEMESH_H
