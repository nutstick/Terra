#include "linemesh.h"

#include "linemeshgeometry.h"

LineMesh::LineMesh(QList<QVector4D> vertices, Qt3DCore::QNode *parent)
    : Qt3DRender::QGeometryRenderer(parent)
    , mLineMeshGeo(new LineMeshGeometry(vertices, this))
{
    setInstanceCount(1);
    setIndexOffset(0);
    setFirstInstance(0);
    // This will allow the line visualization
    setPrimitiveType(Qt3DRender::QGeometryRenderer::LineStrip);

    setVertexCount(mLineMeshGeo->vertexCount());
    setGeometry(mLineMeshGeo);
}


void LineMesh::setVertices(QList<QVector4D> vertices)
{
    mLineMeshGeo->setVertices(vertices);
}
