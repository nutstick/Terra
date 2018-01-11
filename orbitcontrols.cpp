#include "orbitcontrols.h"

#include <Qt3dRender/QCameraLens>

CameraController::CameraController(Qt3DCore::QNode *parent = nullptr)
    : Qt3DCore::QEntity(parent)
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
    , needUpdate(false)

    , enableZoom(true)
    , zoomSpeed(50)
    , enableRotate(true)
    , zoomRotate(50)
    , enablePan(true)
    , keyPanSpeed(5.0)
    , autoRotate(false)
    , autoRotateSpeed(2.0)
    , enableKeys(true)

    , theta(0)
    , phi(0)
    , phiDelta(0)
    , thetaDelta(0)
    , scale(1)
    , panOffset(QVector3D)
    , zoomChanged(false)
    , state(CameraController::State::None)

    , mMouseDevice(new Qt3DInput::QMouseDevice())
    , mKeyboardDevice(new Qt3DInput::QKeyboardDevice())
    , mMouseHandler(new Qt3DInput::QMouseHandler)
    , mLogicalDevice(new Qt3DInput::QLogicalDevice())

    , mLeftMouseButtonAction(new Qt3DInput::QAction())
    , mLeftMouseButtonInput(new Qt3DInput::QActionInput())
    , mMiddleMouseButtonAction(new Qt3DInput::QAction())
    , mMiddleMouseButtonInput(new Qt3DInput::QActionInput())
    , mRightMouseButtonAction(new Qt3DInput::QAction())
    , mRightMouseButtonInput(new Qt3DInput::QActionInput())

    , mShiftAction(new Qt3DInput::QAction())
    , mShiftInput(new Qt3DInput::QActionInput())
    , mWheelAxis(new Qt3DInput::QAxis())
    , mMouseWheelInput(new Qt3DInput::QAnalogAxisInput())
    , mTxAxis(new Qt3DInput::QAxis())
    , mTyAxis(new Qt3DInput::QAxis())
    , mKeyboardTxPosInput(new Qt3DInput::QButtonAxisInput())
    , mKeyboardTyPosInput(new Qt3DInput::QButtonAxisInput())
    , mKeyboardTxNegInput(new Qt3DInput::QButtonAxisInput())
    , mKeyboardTyNegInput(new Qt3DInput::QButtonAxisInput())
{
    // not using QAxis + QAnalogAxisInput for mouse X,Y because
    // it is only in action when a mouse button is pressed.
    mMouseHandler->setSourceDevice(mMouseDevice);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::pressed, this, &CameraController::onMouseDown);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::positionChanged, this, &CameraController::onMouseMove);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::released, this, &CameraController::onMouseUp);
    connect(mMouseHandler, &Qt3DInput::QMouseHandler::wheel, this, &CameraController::onMouseWheel);
    addComponent(mMouseHandler);

    // left mouse button
    mLeftMouseButtonInput->setButtons(QVector<int>() << Qt::LeftButton);
    mLeftMouseButtonInput->setSourceDevice(mMouseDevice);
    mLeftMouseButtonAction->addInput(mLeftMouseButtonInput);

    // middle mouse button
    mMiddleMouseButtonInput->setButtons(QVector<int>() << Qt::MiddleButton);
    mMiddleMouseButtonInput->setSourceDevice(mMouseDevice);
    mMiddleMouseButtonAction->addInput(mMiddleMouseButtonInput);

    // right mouse button
    mRightMouseButtonInput->setButtons(QVector<int>() << Qt::RightButton);
    mRightMouseButtonInput->setSourceDevice(mMouseDevice);
    mRightMouseButtonAction->addInput(mRightMouseButtonInput);

    // Keyboard shift
    mShiftInput->setButtons(QVector<int>() << Qt::Key_Shift);
    mShiftInput->setSourceDevice(mKeyboardDevice);
    mShiftAction->addInput(mShiftInput);

    // Keyboard control
    mControlInput->setButtons(QVector<int>() << Qt::Key_Control);
    mControlInput->setSourceDevice(mKeyboardDevice);
    mControlAction->addInput(mControlInput);

    // Keyboard Pos Tx
    mKeyboardTxPosInput->setButtons(QVector<int>() << Qt::Key_Right);
    mKeyboardTxPosInput->setScale(1.0f);
    mKeyboardTxPosInput->setSourceDevice(mKeyboardDevice);
    mTxAxis->addInput(mKeyboardTxPosInput);

    // Keyboard Pos Ty
    mKeyboardTyPosInput->setButtons(QVector<int>() << Qt::Key_Up);
    mKeyboardTyPosInput->setScale(1.0f);
    mKeyboardTyPosInput->setSourceDevice(mKeyboardDevice);
    mTyAxis->addInput(mKeyboardTyPosInput);

    // Keyboard Neg Tx
    mKeyboardTxNegInput->setButtons(QVector<int>() << Qt::Key_Left);
    mKeyboardTxNegInput->setScale(-1.0f);
    mKeyboardTxNegInput->setSourceDevice(mKeyboardDevice);
    mTxAxis->addInput(mKeyboardTxNegInput);

    // Keyboard Neg Ty
    mKeyboardTyNegInput->setButtons(QVector<int>() << Qt::Key_Down);
    mKeyboardTyNegInput->setScale(-1.0f);
    mKeyboardTyNegInput->setSourceDevice(mKeyboardDevice);
    mTyAxis->addInput(mKeyboardTyNegInput);

    mLogicalDevice->addAction(mLeftMouseButtonAction);
    mLogicalDevice->addAction(mMiddleMouseButtonAction);
    mLogicalDevice->addAction(mRightMouseButtonAction);
    mLogicalDevice->addAction(mShiftAction);
    mLogicalDevice->addAction(mControlAction);
    mLogicalDevice->addAxis(mWheelAxis);
    mLogicalDevice->addAxis(mTxAxis);
    mLogicalDevice->addAxis(mTyAxis);

    // Disable the logical device when the entity is disabled
    connect(this, &Qt3DCore::QEntity::enabledChanged, mLogicalDevice, &Qt3DInput::QLogicalDevice::setEnabled);

    addComponent(mLogicalDevice);

    // From constraint function update()
    offset = QVector3D;
    quat = QQuaternion::fromDirection(mCamera->upVector(), QVector3D(0, 1, 0));
    quatInverse = quat.inverted();

    lastPostiion = QVector3D;
    lastQuaternion = QQuaternion;
}

CameraController::setCamera(Qt3DRender::QCamera *camera)
{
    if (mCamera == camera)
        return;
    mCamera = camera;

    emit cameraChanged();
}

void CameraController::setViewport(const QRect &viewport)
{
  if (mViewport == viewport)
    return;

  mViewport = viewport;
  emit viewportChanged();
}


CameraController::setTarget(QVector3D target)
{
    mTarget = target;
    emit targetChanged();
}

CameraController::setMinDistance(float minDistance)
{
    mMinDistance = minDistance;
    emit minDistanceChanged();
}

CameraController::setMaxDistance(float maxDistance)
{
    mMaxDistance = maxDistance;
    emit maxDistanceChanged();
}

CameraController::setMinZoom(float minZoom)
{
    mMinZoom = minZoom;
    emit minZoomChanged();
}

CameraController::setMaxZoom(float maxZoom)
{
    mMaxZoom = maxZoom;
    emit maxZoomChanged();
}

CameraController::setMinPolarAngle(float minPolarAngle)
{
    mMinPolarAngle = minPolarAngle;
    emit minPolarAngleChanged();
}

CameraController::setMaxPolarAngle(float maxPolarAngle)
{
    mMaxPolarAngle = maxPolarAngle;
    emit maxPolarAngleChanged();
}

CameraController::setMinAzimuthAngle(float minAzimuthAngle)
{
    mMinAzimuthAngle = minAzimuthAngle;
    emit minAzimuthAngleChanged();
}

CameraController::setMaxAzimuthAngle(float maxAzimuthAngle)
{
    mMaxAzimuthAngle = maxAzimuthAngle;
    emit maxAzimuthAngleChanged();
}

CameraController::setEnableDamping(bool enableDamping)
{
    mEnableDamping = enableDamping;
    emit enableDampingChanged();
}

CameraController::setDampingFactor(float dampingFactor)
{
    mDampingFactor = dampingFactor;
    emit dampingFactorChanged();
}

void CameraController::frameTriggered(float dt)
{
    if (mCamera == nullptr)
      return;

    int dx = mMousePos.x() - mLastMousePos.x();
    int dy = mMousePos.y() - mLastMousePos.y();
    mLastMousePos = mMousePos;

    if (this->autoRotate && this->state === CameraController::State::None) {
        rotateLeft(getAutoRotationAngle());
    }

    if (update() == true) {
        // WHAT
        // this.dispatchEvent( changeEvent );
    }
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
    QVector3D _v = QVector3D;
    float* te = mCamera->transform()->matrix().data();
    _v.setX(*te);
    _v.setY(*(te+1));
    _v.setZ(*(te+2));
    _v *= (-distance);

    panOffset += _v;
}

void CameraController::panUp(float ditance)
{
    QVector3D _v = QVector3D;
    float* te = mCamera->transform()->matrix().data();
    _v.setX(*(te+4));
    _v.setY(/*(te+5)*/0);
    _v.setZ(*(te+6));
    _v *= (distance);

    panOffset += _v;
}

void CameraController::pan(float deltaX, float deltaY)
{
    pan(deltaX, deltaY, mViewport.width(), mViewport.height());
}

void CameraController::pan(float deltaX, float deltaY, float screenWidth, float screenHeight)
{
    switch (mCamera->lens()->projectionType()) {
    case Qt3DRender::QCameraLens::PerspectiveProjection:
        // perspective
        QVector3D position = mCamera->position();
        QVector3D offset = position - target();
        float targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= qTan((camera->fieldOfView() / 2) * M_PI / 180.0);

        // we actually don't use screenWidth, since perspective camera is fixed to screen height
        panLeft(2 * deltaX * targetDistance / screenHeight);
        panUp(2 * deltaY * targetDistance / screenHeight);

        break;
    case Qt3DRender::QCameraLens::OrthographicProjection:
        panLeft(2 * deltaX * targetDistance / screenWidth);
        panUp(2 * deltaY * targetDistance / screenHeight);
        break;
    default:
        qWarning() << "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.";
    };
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

void CameraController::update()
{
    QVector3D position = mCamera->position();
    offset = position - target;
    // offset.applyQuaternion( quat );
    offset *= quat.toRotationMatrix();

    theta = qAtan2(offset.x, offset.z);
    phi = qAtan2(qSqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

    theta += thetaDelta;
    phi += phiDelta;

    // restrict theta to be between desired limits
    theta = qMax(mMinAzimuthAngle, qMin(mMaxAzimuthAngle, theta));

    // restrict phi to be between desired limits
    phi = qMax(mMinPolarAngle, qMin(mMaxPolarAngle, phi));

    // restrict phi to be betwee EPS and PI-EPS
    phi = qMax(EPS, qMin(M_PI - EPS, phi));

    float radius = offset.length() * scale;

    // restrict radius to be between desired limits
    radius = qMax(mMinDistance, qMin(mMaxDistance, radius));

    // move target to panned location
    target += panOffset;

    offset.x = radius * qSin( phi ) * qSin( theta );
    offset.y = radius * qCos( phi );
    offset.z = radius * qSin( phi ) * qCos( theta );

    // rotate offset back to "camera-up-vector-is-up" space
    // offset.applyQuaternion( quatInverse );
    offset *= quatInverse.toRotationMatrix();

    position = target + offset;

    // this.object.lookAt( this.target );
    // mCamera->

    if ( mEnableDamping == true ) {
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

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8
    float distance = lastPosition.distanceToPoint( mCamera->position() );
    if ( distance * distance > EPS ||
         8 * (1 - QQuaternion::dotProduct(lastQuaternion, mCamera->transform()->rotation())) > EPS ||
         zoomChanged) {

        lastPosition.copy(camera->position());
        lastQuaternion.copy(mCamera->transform()->rotation());
        zoomChanged = false;

        mLastMove = QTime::currentTime();

        if (!mNeedsUpdate) {
            /*
            scope.needsUpdate = timer.setInterval(function(time){
                if (Date.now()-scope.lastMove < 150) return
                else {
                    updateTiles()
                    timer.clearInterval(scope.needsUpdate)
                    scope.needsUpdate = false
                }
             })
             */
            timer = new QTimer(this);
            mNeedsUpdate = std::make_shared<QMetaObject::Connection>();
            *mNeedsUpdate = QObject::connect(timer, &QTimer::timeout, this, [this]() {
                if (QTime::currentTime() - this->mLastMove < 150) return;
                else {
                    emit updated();
                    disconnect(mNeedsUpdate);
                    this->mNeedsUpdate = NULL;
                }
            });
        }

        return true;

    }

    return false;
}

void CameraController::reset()
{
    state = CameraController::State::None;
    mTarget = this->defaultTarget;
    mCamera->setPosition(this->defaultPosition);
    // mCamera->zoom = defaultZoom;
    // this.dispatchEvent( changeEvent );
    update();
}

void CameraController::straighten()
{
    camera->setPosition(QVector3D(mTarget.x, camera->position().y(), mTarget.y);
}

void CameraController::moveTo(QVector3D coords, float currentHeight)
{
    mTarget = coords;
    camera->setPosition(new Vector3D(coords.x(), currentHeight, coords.z()));
    QTimer::singleShot(10, this, [this]() {
        emit updated());
    });
}

float CameraController::getAutoRotationAngle()
{
    return 2 * Math.PI / 60 / 60 * autoRotateSpeed;
}

float CameraController::getZoomScale(delta)
{
    return Math.pow( 0.999, delta );
}
