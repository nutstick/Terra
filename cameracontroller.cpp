#include "cameracontroller.h"

#include <Qt3dRender/QCameraLens>
#include <Qt3DInput/QMouseEvent>
#include <Qt3DInput/QWheelEvent>
#include "map.h"

float distanceToSquared(QVector3D x, QVector3D y)
{
    return (x.x() - y.x()) * (x.x() - y.x()) + (x.y() - y.y()) * (x.y() - y.y())
            + (x.z() - y.z()) * (x.z() - y.z());
}

CameraController::CameraController(Qt3DCore::QNode *parent)
    : Qt3DCore::QEntity(parent)
    , timer()

    , mMinDistance(0)
    , mMaxDistance(12000)
    , mMinZoom(0)
    , mMaxZoom(INFINITY)
    , mMinPolarAngle(0)
    , mMaxPolarAngle(0.2 * M_PI)
    , mMinAzimuthAngle(-INFINITY)
    , mMaxAzimuthAngle(INFINITY)
    , mEnableDamping(true)
    , mDampingFactor(0.75)
    , mLastMove(QTime::currentTime())

    , lastPosition()
    , lastQuaternion()

    , theta(0)
    , phi(0)
    , phiDelta(0)
    , thetaDelta(0)
    , scale(1)
    , panOffset(QVector3D())
    , zoomChanged(false)

    , enableZoom(true)
    , zoomSpeed(50)
    , enableRotate(true)
    , rotateSpeed(1.0)
    , enablePan(true)
    , keyPanSpeed(5.0)
    , autoRotate(false)
    , autoRotateSpeed(2.0)
    , enableKeys(true)

    , rotateStart(QVector2D())
    , rotateEnd(QVector2D())
    , rotateDelta(QVector2D())
    , panStart(QVector2D())
    , panEnd(QVector2D())
    , panDelta(QVector2D())
    , dollyStart(QVector2D())
    , dollyEnd(QVector2D())
    , dollyDelta(QVector2D())

    , state(CameraController::State::None)

    , mMouseDevice(new Qt3DInput::QMouseDevice())
    , mKeyboardDevice(new Qt3DInput::QKeyboardDevice())
    , mMouseHandler(new Qt3DInput::QMouseHandler())
    , mKeyboardHandler(new Qt3DInput::QKeyboardHandler())
//    , mLogicalDevice(new Qt3DInput::QLogicalDevice())

//    , mLeftMouseButtonAction(new Qt3DInput::QAction())
//    , mLeftMouseButtonInput(new Qt3DInput::QActionInput())
//    , mMiddleMouseButtonAction(new Qt3DInput::QAction())
//    , mMiddleMouseButtonInput(new Qt3DInput::QActionInput())
//    , mRightMouseButtonAction(new Qt3DInput::QAction())
//    , mRightMouseButtonInput(new Qt3DInput::QActionInput())

//    , mShiftAction(new Qt3DInput::QAction())
//    , mShiftInput(new Qt3DInput::QActionInput())
//    , mWheelAxis(new Qt3DInput::QAxis())
//    , mMouseWheelInput(new Qt3DInput::QAnalogAxisInput())
//    , mTxAxis(new Qt3DInput::QAxis())
//    , mTyAxis(new Qt3DInput::QAxis())
//    , mKeyboardTxPosInput(new Qt3DInput::QButtonAxisInput())
//    , mKeyboardTyPosInput(new Qt3DInput::QButtonAxisInput())
//    , mKeyboardTxNegInput(new Qt3DInput::QButtonAxisInput())
//    , mKeyboardTyNegInput(new Qt3DInput::QButtonAxisInput())
{
    // not using QAxis + QAnalogAxisInput for mouse X,Y because
    // it is only in action when a mouse button is pressed.
    mMouseHandler->setSourceDevice(mMouseDevice);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::pressed, this, &CameraController::onMouseDown);
    // connect(mMouseHandler, &Qt3DInput::QMouseHandler::positionChanged, this, &CameraController::onMouseMove);
    // connect(mMouseHandler, &Qt3DInput::QMouseHandler::released, this, &CameraController::onMouseUp);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::wheel, this, &CameraController::onMouseWheel);
    addComponent(mMouseHandler);

    // left mouse button
    // mLeftMouseButtonInput->setButtons(QVector<int>() << Qt::LeftButton);
    // mLeftMouseButtonInput->setSourceDevice(mMouseDevice);
    // mLeftMouseButtonAction->addInput(mLeftMouseButtonInput);

    // middle mouse button
    // mMiddleMouseButtonInput->setButtons(QVector<int>() << Qt::MiddleButton);
    // mMiddleMouseButtonInput->setSourceDevice(mMouseDevice);
    // mMiddleMouseButtonAction->addInput(mMiddleMouseButtonInput);

    // right mouse button
    // mRightMouseButtonInput->setButtons(QVector<int>() << Qt::RightButton);
    // mRightMouseButtonInput->setSourceDevice(mMouseDevice);
    // mRightMouseButtonAction->addInput(mRightMouseButtonInput);

    mKeyboardHandler->setSourceDevice(mKeyboardDevice);;
    connect(mKeyboardHandler, &Qt3DInput::QKeyboardHandler::pressed, this, &CameraController::onKeyDown);
    connect(mKeyboardHandler, &Qt3DInput::QKeyboardHandler::released, this, &CameraController::onKeyUp);
    addComponent(mKeyboardHandler);

    // Keyboard shift
    // mShiftInput->setButtons(QVector<int>() << Qt::Key_Shift);
    // mShiftInput->setSourceDevice(mKeyboardDevice);
    // mShiftAction->addInput(mShiftInput);

    // Keyboard control
    // mControlInput->setButtons(QVector<int>() << Qt::Key_Control);
    // mControlInput->setSourceDevice(mKeyboardDevice);
    // mControlAction->addInput(mControlInput);

    // Keyboard Pos Tx
    // mKeyboardTxPosInput->setButtons(QVector<int>() << Qt::Key_Right);
    // mKeyboardTxPosInput->setScale(1.0f);
    // mKeyboardTxPosInput->setSourceDevice(mKeyboardDevice);
    // mTxAxis->addInput(mKeyboardTxPosInput);

    // Keyboard Pos Ty
    // mKeyboardTyPosInput->setButtons(QVector<int>() << Qt::Key_Up);
    // mKeyboardTyPosInput->setScale(1.0f);
    // mKeyboardTyPosInput->setSourceDevice(mKeyboardDevice);
    // mTyAxis->addInput(mKeyboardTyPosInput);

    // Keyboard Neg Tx
    // mKeyboardTxNegInput->setButtons(QVector<int>() << Qt::Key_Left);
    // mKeyboardTxNegInput->setScale(-1.0f);
    // mKeyboardTxNegInput->setSourceDevice(mKeyboardDevice);
    // mTxAxis->addInput(mKeyboardTxNegInput);

    // Keyboard Neg Ty
    // mKeyboardTyNegInput->setButtons(QVector<int>() << Qt::Key_Down);
    // mKeyboardTyNegInput->setScale(-1.0f);
    // mKeyboardTyNegInput->setSourceDevice(mKeyboardDevice);
    // mTyAxis->addInput(mKeyboardTyNegInput);

    // mLogicalDevice->addAction(mLeftMouseButtonAction);
    // mLogicalDevice->addAction(mMiddleMouseButtonAction);
    // mLogicalDevice->addAction(mRightMouseButtonAction);
    // mLogicalDevice->addAction(mShiftAction);
    // mLogicalDevice->addAction(mControlAction);
    // mLogicalDevice->addAxis(mWheelAxis);
    // mLogicalDevice->addAxis(mTxAxis);
    // mLogicalDevice->addAxis(mTyAxis);

    // Disable the logical device when the entity is disabled
    // connect(this, &Qt3DCore::QEntity::enabledChanged, mLogicalDevice, &Qt3DInput::QLogicalDevice::setEnabled);

    // addComponent(mLogicalDevice);

    // From constraint function update()
}

void CameraController::setMap(Map *map)
{
    if (mMap == map)
        return;
    mMap = map;

    emit mapChanged();
}

void CameraController::setCamera(Qt3DRender::QCamera *camera)
{
    if (mCamera == camera)
        return;
    mCamera = camera;

    quat = QQuaternion::fromDirection(mCamera->upVector(), QVector3D(0, 1, 0));
    quatInverse = quat.inverted();
    defaultPosition = camera->position();

    // TODO: set defaultZoom
    //

    emit cameraChanged();
}

void CameraController::setViewport(const QRect &viewport)
{
  if (mViewport == viewport)
    return;

  mViewport = viewport;
  emit viewportChanged();
}


void CameraController::setTarget(QVector3D target)
{
    mTarget = target;
    defaultTarget = target;

    emit targetChanged();
}

void CameraController::setMinDistance(float minDistance)
{
    mMinDistance = minDistance;
    emit minDistanceChanged();
}

void CameraController::setMaxDistance(float maxDistance)
{
    mMaxDistance = maxDistance;
    emit maxDistanceChanged();
}

void CameraController::setMinZoom(float minZoom)
{
    mMinZoom = minZoom;
    emit minZoomChanged();
}

void CameraController::setMaxZoom(float maxZoom)
{
    mMaxZoom = maxZoom;
    emit maxZoomChanged();
}

void CameraController::setMinPolarAngle(float minPolarAngle)
{
    mMinPolarAngle = minPolarAngle;
    emit minPolarAngleChanged();
}

void CameraController::setMaxPolarAngle(float maxPolarAngle)
{
    mMaxPolarAngle = maxPolarAngle;
    emit maxPolarAngleChanged();
}

void CameraController::setMinAzimuthAngle(float minAzimuthAngle)
{
    mMinAzimuthAngle = minAzimuthAngle;
    emit minAzimuthAngleChanged();
}

void CameraController::setMaxAzimuthAngle(float maxAzimuthAngle)
{
    mMaxAzimuthAngle = maxAzimuthAngle;
    emit maxAzimuthAngleChanged();
}

void CameraController::setEnableDamping(bool enableDamping)
{
    mEnableDamping = enableDamping;
    emit enableDampingChanged();
}

void CameraController::setDampingFactor(float dampingFactor)
{
    mDampingFactor = dampingFactor;
    emit dampingFactorChanged();
}

void CameraController::frameTriggered()
{
    if (mCamera == nullptr)
      return;

    if (autoRotate && state == CameraController::State::None) {
        rotateLeft(getAutoRotationAngle());
    }

    if (update() == true) {
        // WHAT
        // this.dispatchEvent( changeEvent );
    }
}

void CameraController::onMouseDown(Qt3DInput::QMouseEvent *mouse)
{
    // if (!enabled) return;
    if (mouse->button() == Qt::RightButton && mouse->modifiers() & Qt3DInput::QMouseEvent::ControlModifier) {
        if (!enableRotate) return;

        state = CameraController::State::Rotate;

        rotateStart = QVector2D(mouse->x(), mouse->y());
    } else if (mouse->button() == Qt::MiddleButton) {
        if (!enableZoom) return;

        state = CameraController::State::Dolly;

        dollyStart = QVector2D(mouse->x(), mouse->y());
    } else if (mouse->button() == Qt::LeftButton) {
        if (!enablePan) return;

        state = CameraController::State::Pan;

        panStart = QVector2D(mouse->x(), mouse->y());

        // TODO:
        // moveMap();
    }

    if (state != CameraController::State::None) {
        connect(mMouseHandler, &Qt3DInput::QMouseHandler::positionChanged, this, &CameraController::onMouseMove);
        connect(mMouseHandler, &Qt3DInput::QMouseHandler::released, this, &CameraController::onMouseUp);
    }
}

void CameraController::onMouseMove(Qt3DInput::QMouseEvent *mouse)
{
    // if (!enabled) return;

    if (state == CameraController::State::Rotate) {
        if (!enableRotate) return;

        rotateEnd = QVector2D(mouse->x(), mouse->y());
        rotateDelta = rotateEnd - rotateStart;

        // rotating across whole screen goes 360 degrees around
        rotateLeft(2 * M_PI * rotateDelta.x() / mViewport.width() * rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp(2 * M_PI * rotateDelta.y() / mViewport.height() * rotateSpeed);

        rotateStart = rotateEnd;
    } else if (state == CameraController::State::Dolly) {
        if (!enableZoom) return;

        dollyEnd = QVector2D(mouse->x(), mouse->y());
        dollyDelta = dollyEnd - dollyStart;

        if (dollyDelta.y() > 0) {
            dollyIn(getZoomScale(dollyDelta.y()));
        } else if (dollyDelta.y() < 0) {
            dollyOut(getZoomScale(-dollyDelta.y()));
        }

        dollyStart = dollyEnd;
    } else if (state == CameraController::State::Pan) {
        if (!enablePan) return;

        panEnd = QVector2D(mouse->x(), mouse->y());
        panDelta = panEnd - panStart;

        pan(panDelta.x(), panDelta.y());

        panStart = panEnd;
    }

    if (state != CameraController::State::None) frameTriggered();
}

void CameraController::onMouseUp(Qt3DInput::QMouseEvent *mouse)
{
    // if (!enabled) return;

    disconnect(mMouseHandler, &Qt3DInput::QMouseHandler::positionChanged, this, &CameraController::onMouseMove);
    disconnect(mMouseHandler, &Qt3DInput::QMouseHandler::released, this, &CameraController::onMouseUp);

    state = CameraController::State::None;

    // stopMap();
}

void CameraController::onMouseWheel(Qt3DInput::QWheelEvent *wheel)
{
    // qDebug() << "TODO Mouse Wheel";
    float delta = wheel->angleDelta().y();

    dollyOut(getZoomScale(delta));

    frameTriggered();

    // off-center zooming :D
    if (mCamera->position().y() >= mMaxDistance) return;
    float direction = -delta * 0.001001001;
    pan(direction * (wheel->x() - mViewport.width() / 2), direction * (wheel->y() - mViewport.height() / 2));
}

void CameraController::keyDownInterval()
{
    switch (keyDown) {
    case Qt::UpArrow:
        pan(0, keyPanSpeed);
        frameTriggered();
        break;
    case Qt::DownArrow:
        pan(0, -keyPanSpeed);
        break;
    case Qt::LeftArrow:
        pan(keyPanSpeed, 0);
        break;
    case Qt::RightArrow:
        pan(-keyPanSpeed, 0);
        break;
    }
}

void CameraController::onKeyDown(Qt3DInput::QKeyEvent *event)
{
    // if (keyDown || !enabled || !enableKeys || !enablePan) return;
    if (keyDown || !enableKeys || !enablePan) return;

    keyDown = event->key();

    keyDownTimer = new QTimer();
    keyDownTimer->setInterval(10);
    connect(keyDownTimer, &QTimer::timeout, this, &CameraController::keyDownInterval);
}

void CameraController::onKeyUp(Qt3DInput::QKeyEvent *event)
{
    if (event->key() == keyDown) {
        disconnect(keyDownTimer, &QTimer::timeout, this, &CameraController::keyDownInterval);

        keyDownTimer = NULL;
        keyDown = NULL;
    }
}

void CameraController::reset()
{
    state = CameraController::State::None;
    mTarget = defaultTarget;
    mCamera->setPosition(defaultPosition);
    // mCamera->zoom = defaultZoom;
    // this.dispatchEvent( changeEvent );
    frameTriggered();
}

void CameraController::straighten()
{
    mCamera->setPosition(QVector3D(mTarget.x(), mCamera->position().y(), mTarget.y()));
}

void CameraController::moveTo(QVector3D coords, float currentHeight)
{
    mTarget = coords;
    mCamera->setPosition(QVector3D(coords.x(), currentHeight, coords.z()));
    QTimer::singleShot(10, this, [this]() {
        emit updated();
    });
}

void CameraController::rotateLeft(float angle)
{
    thetaDelta -= angle;

    // TODO:
    // compass.update();
}

void CameraController::rotateUp(float angle)
{
    phiDelta -= angle;

    // TODO:
    // compass.update();
}

void CameraController::panLeft(float distance)
{
    QVector3D _v = QVector3D();
//    float* te = mCamera->transform()->matrix().data();
//    qDebug() << mCamera->transform()->matrix();
//    _v.setX(*te);
//    _v.setY(*(te+1));
//    _v.setZ(*(te+2));
    _v.setX(0);
    _v.setY(0);
    _v.setZ(1);
    _v *= (-distance);

    panOffset += _v;
}

void CameraController::panUp(float distance)
{
    QVector3D _v = QVector3D();
//    float* te = mCamera->transform()->matrix().data();
//    _v.setX(*(te+4));
//    _v.setY(*(te+5));
//    _v.setZ(*(te+6));
    _v.setX(1);
    _v.setY(0);
    _v.setZ(0);
    _v *= distance;

    panOffset += _v;
}

void CameraController::pan(float deltaX, float deltaY)
{
    pan(deltaX, deltaY, mViewport.width(), mViewport.height());
}

void CameraController::pan(float deltaX, float deltaY, float screenWidth, float screenHeight)
{
    if (mCamera->lens()->projectionType() == Qt3DRender::QCameraLens::PerspectiveProjection) {
        // perspective
        QVector3D position = mCamera->position();
        QVector3D offset = position - mTarget;
        float targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= qTan((mCamera->fieldOfView() / 2) * M_PI / 180.0);

        // we actually don't use screenWidth, since perspective camera is fixed to screen height
        panLeft(2 * deltaX * targetDistance / screenHeight);
        panUp(2 * deltaY * targetDistance / screenHeight);
    } else if (mCamera->lens()->projectionType() == Qt3DRender::QCameraLens::OrthographicProjection) {
        panLeft(2.0 * deltaX * (mCamera->right() - mCamera->left()) / screenWidth);
        panUp(2.0 * deltaY * (mCamera->top() - mCamera->bottom()) / screenHeight);
    } else {
        qWarning() << "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.";
    }
}

void CameraController::dollyIn(float dollyScale)
{
    switch (mCamera->lens()->projectionType()) {
    case Qt3DRender::QCameraLens::PerspectiveProjection:
        // perspective
        scale /= dollyScale;
        break;
    case Qt3DRender::QCameraLens::OrthographicProjection:
        // mCamera->lens()->
        // mCamera->= Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
        // mCamera->updateProjectionMatrix();
        // zoomChanged = true;
        break;
    default:
        qWarning() << "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.";
    }
}

void CameraController::dollyOut(float dollyScale)
{
    switch (mCamera->lens()->projectionType()) {
    case Qt3DRender::QCameraLens::PerspectiveProjection:
        // perspective
        scale *= dollyScale;
        break;
    case Qt3DRender::QCameraLens::OrthographicProjection:
        // mCamera->lens()->
        // mCamera->= Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
        // mCamera->updateProjectionMatrix();
        // zoomChanged = true;
        break;
    default:
        qWarning() << "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.";
    }
}

bool CameraController::update()
{
    QVector3D position = mCamera->position();

    offset = position - mTarget;

    offset = quat.rotatedVector(offset);

    theta = qAtan2(offset.x(), offset.z());

    phi = qAtan2(qSqrt(offset.x() * offset.x() + offset.z() * offset.z()), offset.y());

    theta += thetaDelta;
    phi += phiDelta;

    // restrict theta to be between desired limits
    theta = qMax(mMinAzimuthAngle, qMin(mMaxAzimuthAngle, theta));

    // restrict phi to be between desired limits
    phi = qMax(mMinPolarAngle, qMin(mMaxPolarAngle, phi));

    // restrict phi to be betwee EPS and PI-EPS
    phi = qMax(EPS, qMin((float)M_PI - EPS, phi));

    float radius = offset.length() * scale;

    radius = qMax(mMinDistance, qMin(mMaxDistance, radius));

    mTarget += panOffset;

    offset.setX(radius * qSin(phi) * qSin(theta));
    offset.setY(radius * qCos(phi));
    offset.setZ(radius * qSin(phi) * qSin(theta));

    offset = quatInverse.rotatedVector(offset);

    // set Position
    mCamera->setPosition(mTarget + offset);
    // look at target
    mCamera->setViewCenter(mTarget);
    Qt3DCore::QTransform* transform = mCamera->transform();

    // transform->matrix().lookAt(mCamera->position(), mTarget, mCamera->upVector());
    if (mEnableDamping == true) {
        thetaDelta *= (1 - mDampingFactor);
        phiDelta *= (1 - mDampingFactor);
    } else {
        thetaDelta = 0;
        phiDelta = 0;
    }

    scale = 1;
    panOffset.setX(0);
    panOffset.setY(0);
    panOffset.setZ(0);

    qDebug() << "OM" << distanceToSquared(lastPosition, mCamera->position());
    if (distanceToSquared(lastPosition, mCamera->position()) > EPS ||
            8 * (1 - QQuaternion::dotProduct(lastQuaternion, transform->rotation())) > EPS ||
                 zoomChanged) {
        lastPosition = mCamera->position();
        lastQuaternion = transform->rotation();
        zoomChanged = false;

        mLastMove.start();

        if (!mNeedsUpdate) {
            mNeedsUpdate = true;
            needUpdateTimer = new QTimer();
            connect(needUpdateTimer, &QTimer::timeout, this, &CameraController::needUpdateInterval);
        }

        return true;
    }

    return false;
}

void CameraController::needUpdateInterval()
{
    qDebug() << "p";
    if (mLastMove.elapsed() < 150) return;
    else {
        qDebug() << "p2";
        if (mMap) {
            mMap->update();
        }

        mNeedsUpdate = false;
        disconnect(needUpdateTimer, &QTimer::timeout, this, &CameraController::needUpdateInterval);
    }
}

float CameraController::getAutoRotationAngle()
{
    return 2 * M_PI / 60 / 60 * autoRotateSpeed;
}

float CameraController::getZoomScale(float delta)
{
    return qPow( 0.999, delta );
}