#include "linemeshgeometry.h"

LineMeshGeometry::LineMeshGeometry(QList<QVector4D> vertices, Qt3DCore::QNode *parent)
    : Qt3DRender::QGeometry(parent)
    , mPositionAttribute(new Qt3DRender::QAttribute(this))
    , mVertexBuffer(new Qt3DRender::QBuffer(Qt3DRender::QBuffer::VertexBuffer, this))
{
    QByteArray vertexBufferData;
    vertexBufferData.resize(vertices.size() * 3 * sizeof(float));
    float *rawVertexArray = reinterpret_cast<float *>(vertexBufferData.data());
    int idx = 0;
    for (const QVector4D &v : vertices) {
        rawVertexArray[idx++] = v.x();
        rawVertexArray[idx++] = v.y();
        rawVertexArray[idx++] = v.z();
        mVertices.append(v.toVector3D());
    }

    mVertexBuffer->setData(vertexBufferData);

    mPositionAttribute->setAttributeType(Qt3DRender::QAttribute::VertexAttribute);
    mPositionAttribute->setBuffer(mVertexBuffer);
    mPositionAttribute->setDataType(Qt3DRender::QAttribute::Float);
    mPositionAttribute->setDataSize(3);
    mPositionAttribute->setName(Qt3DRender::QAttribute::defaultPositionAttributeName());

    addAttribute(mPositionAttribute);
}

int LineMeshGeometry::vertexCount()
{
    return mVertices.size();
}
