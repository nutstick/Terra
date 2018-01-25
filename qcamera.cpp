/****************************************************************************
**
** Copyright (C) 2014 Klaralvdalens Datakonsult AB (KDAB).
** Contact: https://www.qt.io/licensing/
**
** This file is part of the Qt3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** Commercial License Usage
** Licensees holding valid commercial Qt licenses may use this file in
** accordance with the commercial license agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and The Qt Company. For licensing terms
** and conditions see https://www.qt.io/terms-conditions. For further
** information use the contact form at https://www.qt.io/contact-us.
**
** GNU Lesser General Public License Usage
** Alternatively, this file may be used under the terms of the GNU Lesser
** General Public License version 3 as published by the Free Software
** Foundation and appearing in the file LICENSE.LGPL3 included in the
** packaging of this file. Please review the following information to
** ensure the GNU Lesser General Public License version 3 requirements
** will be met: https://www.gnu.org/licenses/lgpl-3.0.html.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU
** General Public License version 2.0 or (at your option) the GNU General
** Public license version 3 or any later version approved by the KDE Free
** Qt Foundation. The licenses are as published by the Free Software
** Foundation and appearing in the file LICENSE.GPL2 and LICENSE.GPL3
** included in the packaging of this file. Please review the following
** information to ensure the GNU General Public License requirements will
** be met: https://www.gnu.org/licenses/gpl-2.0.html and
** https://www.gnu.org/licenses/gpl-3.0.html.
**
** $QT_END_LICENSE$
**
****************************************************************************/

#include "qcamera.h"

#include <QtMath>

#include <Qt3DRender/QCameraLens>
#include <Qt3DCore/QTransform>

QT_BEGIN_NAMESPACE

void QCamera::updateViewMatrixAndTransform(bool doEmit)
{
    const QVector3D viewDirection = (m_viewCenter - m_position).normalized();

    QMatrix4x4 transformMatrix;
    transformMatrix.translate(m_position);

    // Negative viewDirection because OpenGL convention is looking down -Z
    transformMatrix.rotate(QQuaternion::fromDirection(-viewDirection, m_upVector.normalized()));

    m_transform->setMatrix(transformMatrix);

    QMatrix4x4 viewMatrix;
    viewMatrix.lookAt(m_position, m_viewCenter, m_upVector);
    m_viewMatrix = viewMatrix;
    if (doEmit)
        emit viewMatrixChanged();
}

/*!
 * Creates a new QCamera instance with the
 * specified \a parent.
 */
QCamera::QCamera(Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , m_position(0.0f, 0.0f, 0.0f)
    , m_viewCenter(0.0f, 0.0f, -100.0f)
    , m_upVector(0.0f, 1.0f, 0.0f)
    , m_cameraToCenter(m_viewCenter - m_position)
    , m_viewMatrixDirty(false)
    , m_lens(new Qt3DRender::QCameraLens())
    , m_transform(new Qt3DCore::QTransform())
{
    QObject::connect(m_lens, SIGNAL(projectionTypeChanged(Qt3DRender::QCameraLens::ProjectionType)), this, SIGNAL(projectionTypeChanged(Qt3DRender::QCameraLens::ProjectionType)));
    QObject::connect(m_lens, SIGNAL(nearPlaneChanged(float)), this, SIGNAL(nearPlaneChanged(float)));
    QObject::connect(m_lens, SIGNAL(farPlaneChanged(float)), this, SIGNAL(farPlaneChanged(float)));
    QObject::connect(m_lens, SIGNAL(fieldOfViewChanged(float)), this, SIGNAL(fieldOfViewChanged(float)));
    QObject::connect(m_lens, SIGNAL(aspectRatioChanged(float)), this, SIGNAL(aspectRatioChanged(float)));
    QObject::connect(m_lens, SIGNAL(leftChanged(float)), this, SIGNAL(leftChanged(float)));
    QObject::connect(m_lens, SIGNAL(rightChanged(float)), this, SIGNAL(rightChanged(float)));
    QObject::connect(m_lens, SIGNAL(bottomChanged(float)), this, SIGNAL(bottomChanged(float)));
    QObject::connect(m_lens, SIGNAL(topChanged(float)), this, SIGNAL(topChanged(float)));
    QObject::connect(m_lens, SIGNAL(projectionMatrixChanged(const QMatrix4x4 &)), this, SIGNAL(projectionMatrixChanged(const QMatrix4x4 &)));
    QObject::connect(m_lens, SIGNAL(exposureChanged(float)), this, SIGNAL(exposureChanged(float)));
    QObject::connect(m_lens, &Qt3DRender::QCameraLens::viewSphere, this, &QCamera::viewSphere);

    addComponent(m_lens);
    addComponent(m_transform);
}

/*!
 * \internal
 */
QCamera::~QCamera()
{
}

/*!
 * \internal
 */
//QCamera::QCamera(Qt3DCore::QNode *parent)
//    : Qt3DCore::QEntity(parent)
//{
//    updateViewMatrixAndTransform(false);

//    QObject::connect(m_lens, SIGNAL(projectionTypeChanged(Qt3DRender::QCameraLens::ProjectionType)), this, SIGNAL(projectionTypeChanged(Qt3DRender::QCameraLens::ProjectionType)));
//    QObject::connect(m_lens, SIGNAL(nearPlaneChanged(float)), this, SIGNAL(nearPlaneChanged(float)));
//    QObject::connect(m_lens, SIGNAL(farPlaneChanged(float)), this, SIGNAL(farPlaneChanged(float)));
//    QObject::connect(m_lens, SIGNAL(fieldOfViewChanged(float)), this, SIGNAL(fieldOfViewChanged(float)));
//    QObject::connect(m_lens, SIGNAL(aspectRatioChanged(float)), this, SIGNAL(aspectRatioChanged(float)));
//    QObject::connect(m_lens, SIGNAL(leftChanged(float)), this, SIGNAL(leftChanged(float)));
//    QObject::connect(m_lens, SIGNAL(rightChanged(float)), this, SIGNAL(rightChanged(float)));
//    QObject::connect(m_lens, SIGNAL(bottomChanged(float)), this, SIGNAL(bottomChanged(float)));
//    QObject::connect(m_lens, SIGNAL(topChanged(float)), this, SIGNAL(topChanged(float)));
//    QObject::connect(m_lens, SIGNAL(projectionMatrixChanged(const QMatrix4x4 &)), this, SIGNAL(projectionMatrixChanged(const QMatrix4x4 &)));
//    QObject::connect(m_lens, &QCameraLens::viewSphere, this, &QCamera::viewSphere);

//    addComponent(m_lens);
//    addComponent(m_transform);
//}

/*!
 * Returns the current lens.
 */
Qt3DRender::QCameraLens *QCamera::lens() const
{
    return m_lens;
}

/*!
 * Returns the camera's position via transform.
 */
Qt3DCore::QTransform *QCamera::transform() const
{
    return m_transform;
}

/*!
 * Translates the camera's position and its view vector by \a vLocal in local coordinates.
 * The \a option allows for toggling whether the view center should be translated.
 */
void QCamera::translate(const QVector3D &vLocal, CameraTranslationOption option)
{
    QVector3D viewVector = viewCenter() - position(); // From "camera" position to view center

    // Calculate the amount to move by in world coordinates
    QVector3D vWorld;
    if (!qFuzzyIsNull(vLocal.x())) {
        // Calculate the vector for the local x axis
        const QVector3D x = QVector3D::crossProduct(viewVector, upVector()).normalized();
        vWorld += vLocal.x() * x;
    }

    if (!qFuzzyIsNull(vLocal.y()))
        vWorld += vLocal.y() * upVector();

    if (!qFuzzyIsNull(vLocal.z()))
        vWorld += vLocal.z() * viewVector.normalized();

    // Update the camera position using the calculated world vector
    setPosition(position() + vWorld);

    // May be also update the view center coordinates
    if (option == TranslateViewCenter)
        setViewCenter(viewCenter() + vWorld);

    // Refresh the camera -> view center vector
    viewVector = viewCenter() - position();

    // Calculate a new up vector. We do this by:
    // 1) Calculate a new local x-direction vector from the cross product of the new
    //    camera to view center vector and the old up vector.
    // 2) The local x vector is the normal to the plane in which the new up vector
    //    must lay. So we can take the cross product of this normal and the new
    //    x vector. The new normal vector forms the last part of the orthonormal basis
    const QVector3D x = QVector3D::crossProduct(viewVector, upVector()).normalized();
    setUpVector(QVector3D::crossProduct(x, viewVector).normalized());
}

/*!
 * Translates the camera's position and its view vector by \a vWorld in world coordinates.
 * The \a option allows for toggling whether the view center should be translated.
 */
void QCamera::translateWorld(const QVector3D &vWorld, CameraTranslationOption option)
{
    // Update the camera position using the calculated world vector
    setPosition(position() + vWorld);

    // May be also update the view center coordinates
    if (option == TranslateViewCenter)
        setViewCenter(viewCenter() + vWorld);
}

/*!
 * Returns the calculated tilt rotation in relation to the \a angle in degrees taken in
 * to adjust the camera's tilt or up/down rotation on the X axis.
 */
QQuaternion QCamera::tiltRotation(float angle) const
{
    const QVector3D viewVector = viewCenter() - position();
    const QVector3D xBasis = QVector3D::crossProduct(upVector(), viewVector.normalized()).normalized();
    return QQuaternion::fromAxisAndAngle(xBasis, -angle);
}

/*!
 * Returns the calculated pan rotation in relation to the \a angle in degrees taken in
 * to adjust the camera's pan or left/right rotation on the Y axis.
 */
QQuaternion QCamera::panRotation(float angle) const
{
    return QQuaternion::fromAxisAndAngle(upVector(), angle);
}

/*!
 * Returns the calculated roll rotation in relation to the \a angle in degrees taken in
 * to adjust the camera's roll or lean left/right rotation on the Z axis.
 */
QQuaternion QCamera::rollRotation(float angle) const
{
    QVector3D viewVector = viewCenter() - position();
    return QQuaternion::fromAxisAndAngle(viewVector, -angle);
}

/*!
 * Returns the calculated rotation in relation to the \a angle in degrees and
 * chosen \a axis taken in.
 */
QQuaternion QCamera::rotation(float angle, const QVector3D &axis) const
{
    return QQuaternion::fromAxisAndAngle(axis, angle);
}

/*!
 * Adjusts the tilt angle of the camera by \a angle in degrees.
 */
void QCamera::tilt(float angle)
{
    QQuaternion q = tiltRotation(angle);
    rotate(q);
}

/*!
 * Adjusts the pan angle of the camera by \a angle in degrees.
 */
void QCamera::pan(float angle)
{
    QQuaternion q = panRotation(-angle);
    rotate(q);
}

/*!
 * Adjusts the pan angle of the camera by \a angle in degrees on a chosen \a axis.
 */
void QCamera::pan(float angle, const QVector3D &axis)
{
    QQuaternion q = rotation(-angle, axis);
    rotate(q);
}

/*!
 * Adjusts the camera roll by \a angle in degrees.
 */
void QCamera::roll(float angle)
{
    QQuaternion q = rollRotation(-angle);
    rotate(q);
}

/*!
 * Adjusts the camera tilt about view center by \a angle in degrees.
 */
void QCamera::tiltAboutViewCenter(float angle)
{
    QQuaternion q = tiltRotation(-angle);
    rotateAboutViewCenter(q);
}

/*!
 * Adjusts the camera pan about view center by \a angle in degrees.
 */
void QCamera::panAboutViewCenter(float angle)
{
    QQuaternion q = panRotation(angle);
    rotateAboutViewCenter(q);
}

/*!
 * Adjusts the camera pan about view center by \a angle in degrees on \a axis.
 */
void QCamera::panAboutViewCenter(float angle, const QVector3D &axis)
{
    QQuaternion q = rotation(angle, axis);
    rotateAboutViewCenter(q);
}

/*!
 * Adjusts the camera roll about view center by \a angle in degrees.
 */
void QCamera::rollAboutViewCenter(float angle)
{
    QQuaternion q = rollRotation(angle);
    rotateAboutViewCenter(q);
}

/*!
 * Rotates the camera with the use of a Quaternion in \a q.
 */
void QCamera::rotate(const QQuaternion& q)
{
    setUpVector(q * upVector());
    QVector3D viewVector = viewCenter() - position();
    QVector3D cameraToCenter = q * viewVector;
    setViewCenter(position() + cameraToCenter);
}

/*!
 * Rotates the camera about the view center with the use of a Quaternion
 * in \a q.
 */
void QCamera::rotateAboutViewCenter(const QQuaternion& q)
{
    setUpVector(q * upVector());
    QVector3D viewVector = viewCenter() - position();
    QVector3D cameraToCenter = q * viewVector;
    setPosition(viewCenter() - cameraToCenter);
    setViewCenter(position() + cameraToCenter);
}

/*!
 * Rotates and moves the camera so that it's viewCenter is the center of the scene's bounding volume
 * and the entire scene fits in the view port.
 *
 * \note Only works if the lens is in perspective projection mode.
 * \sa Qt3D.Render::Camera::projectionType
 */
void QCamera::viewAll()
{
    m_lens->viewAll(id());
}

/*!
 * Rotates and moves the camera so that it's viewCenter is \a center
 * and a sphere of \a radius fits in the view port.
 *
 * \note Only works if the lens is in perspective projection mode.
 * \sa Qt3D.Render::Camera::projectionType
 */
void QCamera::viewSphere(const QVector3D &center, float radius)
{
    if (m_lens->projectionType() != Qt3DRender::QCameraLens::PerspectiveProjection || radius <= 0.f)
        return;
    double dist = radius / std::tan(qDegreesToRadians(m_lens->fieldOfView()) / 2.0f);
    QVector3D dir = (m_viewCenter - m_position).normalized();
    QVector3D newPos = center - (dir * dist);
    setViewCenter(center);
    setPosition(newPos);
}

/*!
 * Rotates and moves the camera so that it's viewCenter is the center of the entity's bounding volume
 * and the entire entity fits in the view port.
 *
 * \note Only works if the lens is in perspective projection mode.
 * \sa Qt3D.Render::Camera::projectionType
 */
void QCamera::viewEntity(Qt3DCore::QEntity *entity)
{
    if (!entity)
        return;
    m_lens->viewEntity(entity->id(), id());
}

/*!
 * Sets the camera's projection type to \a type.
 */
void QCamera::setProjectionType(Qt3DRender::QCameraLens::ProjectionType type)
{
    m_lens->setProjectionType(type);
}

Qt3DRender::QCameraLens::ProjectionType QCamera::projectionType() const
{
    return m_lens->projectionType();
}

/*!
 * Sets the camera's near plane to \a nearPlane.
 */
void QCamera::setNearPlane(float nearPlane)
{
    m_lens->setNearPlane(nearPlane);
}

float QCamera::nearPlane() const
{
    return m_lens->nearPlane();
}

/*!
 * Sets the camera's far plane to \a farPlane
 */
void QCamera::setFarPlane(float farPlane)
{
    m_lens->setFarPlane(farPlane);
}

float QCamera::farPlane() const
{
    return m_lens->farPlane();
}

/*!
 * Sets the camera's field of view to \a fieldOfView in degrees.
 */
void QCamera::setFieldOfView(float fieldOfView)
{
    m_lens->setFieldOfView(fieldOfView);
}

float QCamera::fieldOfView() const
{
    return m_lens->fieldOfView();
}

/*!
 * Sets the camera's aspect ratio to \a aspectRatio.
 */
void QCamera::setAspectRatio(float aspectRatio)
{
    m_lens->setAspectRatio(aspectRatio);
}

float QCamera::aspectRatio() const
{
    return m_lens->aspectRatio();
}

/*!
 * Sets the left of the camera to \a left.
 */
void QCamera::setLeft(float left)
{
    m_lens->setLeft(left);
}

float QCamera::left() const
{
    return m_lens->left();
}

/*!
 * Sets the right of the camera to \a right.
 */
void QCamera::setRight(float right)
{
    m_lens->setRight(right);
}

float QCamera::right() const
{
    return m_lens->right();
}

/*!
 * Sets the bottom of the camera to \a bottom.
 */
void QCamera::setBottom(float bottom)
{
    m_lens->setBottom(bottom);
}

float QCamera::bottom() const
{
    return m_lens->bottom();
}

/*!
 * Sets the top of the camera to \a top.
 */
void QCamera::setTop(float top)
{
    m_lens->setTop(top);
}

float QCamera::top() const
{
    return m_lens->top();
}

/*!
 * Sets the camera's projection matrix to \a projectionMatrix.
 */
void QCamera::setProjectionMatrix(const QMatrix4x4 &projectionMatrix)
{
    m_lens->setProjectionMatrix(projectionMatrix);
}

/*!
 * Sets the camera's exposure to \a exposure.
 */
void QCamera::setExposure(float exposure)
{
    m_lens->setExposure(exposure);
}

QMatrix4x4 QCamera::projectionMatrix() const
{
    return m_lens->projectionMatrix();
}

float QCamera::exposure() const
{
    return m_lens->exposure();
}

/*!
 * Sets the camera's position in 3D space to \a position.
 */
void QCamera::setPosition(const QVector3D &position)
{
    // if (!qFuzzyCompare(m_position, position)) {
    m_position = position;
    m_cameraToCenter = m_viewCenter - position;
    m_viewMatrixDirty = true;
    emit positionChanged(position);
    emit viewVectorChanged(m_cameraToCenter);
    updateViewMatrixAndTransform();
    // }
}

QVector3D QCamera::position() const
{
    return m_position;
}

/*!
 * Sets the camera's up vector to \a upVector.
 */
void QCamera::setUpVector(const QVector3D &upVector)
{
    // if (!qFuzzyCompare(m_upVector, upVector)) {
    m_upVector = upVector;
    m_viewMatrixDirty = true;
    emit upVectorChanged(upVector);
    updateViewMatrixAndTransform();
    // }
}

QVector3D QCamera::upVector() const
{
    return m_upVector;
}

/*!
 * Sets the camera's view center to \a viewCenter.
 */
void QCamera::setViewCenter(const QVector3D &viewCenter)
{
    // if (!qFuzzyCompare(m_viewCenter, viewCenter)) {
    m_viewCenter = viewCenter;
    m_cameraToCenter = viewCenter - m_position;
    m_viewMatrixDirty = true;
    emit viewCenterChanged(viewCenter);
    emit viewVectorChanged(m_cameraToCenter);
    updateViewMatrixAndTransform();
    // }
}

QVector3D QCamera::viewCenter() const
{
    return m_viewCenter;
}

QVector3D QCamera::viewVector() const
{
    return m_cameraToCenter;
}

QMatrix4x4 QCamera::viewMatrix() const
{
    return m_viewMatrix;
}

QT_END_NAMESPACE
