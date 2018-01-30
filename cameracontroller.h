#ifndef CAMERACONTROLLER_H
#define CAMERACONTROLLER_H

#include <Qt3DCore>
#include <Qt3DInput>
#include <QMetaObject>
#include <jstimer.h>
#include <Qt3DRender/QCamera>
//#include "mycamera.h"

class Map;

class CameraController : public Qt3DCore::QEntity
{
    Q_OBJECT
    Q_PROPERTY(Map *map READ map WRITE setMap NOTIFY mapChanged)
    Q_PROPERTY(Qt3DRender::QCamera *camera READ camera WRITE setCamera NOTIFY cameraChanged)
    Q_PROPERTY(QRect viewport READ viewport WRITE setViewport NOTIFY viewportChanged)
    Q_PROPERTY(QVector3D target READ target WRITE setTarget NOTIFY targetChanged)
    Q_PROPERTY(qreal minDistance READ minDistance WRITE setMinDistance NOTIFY minDistanceChanged)
    Q_PROPERTY(qreal maxDistance READ maxDistance WRITE setMaxDistance NOTIFY maxDistanceChanged)
    Q_PROPERTY(int minZoom READ minZoom WRITE setMinZoom NOTIFY minZoomChanged)
    Q_PROPERTY(int maxZoom READ maxZoom WRITE setMaxZoom NOTIFY maxZoomChanged)
    Q_PROPERTY(qreal minPolarAngle READ minPolarAngle WRITE setMinPolarAngle NOTIFY minPolarAngleChanged)
    Q_PROPERTY(qreal maxPolarAngle READ maxPolarAngle WRITE setMaxPolarAngle NOTIFY maxPolarAngleChanged)
    Q_PROPERTY(qreal minAzimuthAngle READ minAzimuthAngle WRITE setMinAzimuthAngle NOTIFY minAzimuthAngleChanged)
    Q_PROPERTY(qreal maxAzimuthAngle READ maxAzimuthAngle WRITE setMaxAzimuthAngle NOTIFY maxAzimuthAngleChanged)
    Q_PROPERTY(bool enableDamping READ enableDamping WRITE setEnableDamping NOTIFY enableDampingChanged)
    Q_PROPERTY(qreal dampingFactor READ dampingFactor WRITE setDampingFactor NOTIFY dampingFactorChanged)
    Q_PROPERTY(qreal maxClickTimeInterval READ maxClickTimeInterval WRITE setMaxClickTimeInterval NOTIFY maxClickTimeIntervalChanged)
public:
    CameraController(Qt3DCore::QNode *parent = nullptr);

    Map *map() const { return mMap; }
    Qt3DRender::QCamera *camera() const { return mCamera; }
    QRect viewport() const { return mViewport; }
    QVector3D target() const { return mTarget; }
    qreal minDistance() const { return mMinDistance; }
    qreal maxDistance() const { return mMaxDistance; }
    int minZoom() const { return mMinZoom; }
    int maxZoom() const { return mMaxZoom; }
    qreal minPolarAngle() const { return mMinPolarAngle; }
    qreal maxPolarAngle() const { return mMaxPolarAngle; }
    qreal minAzimuthAngle() const { return mMinAzimuthAngle; }
    qreal maxAzimuthAngle() const { return mMaxAzimuthAngle; }
    bool enableDamping() const { return mEnableDamping; }
    qreal dampingFactor() const { return mDampingFactor; }
    qreal maxClickTimeInterval() const { return mMaxClickTimeInterval; }

    void setMap(Map* map);
    void setCamera(Qt3DRender::QCamera *camera);
    void setViewport(const QRect& viewport);
    void setTarget(QVector3D target);
    void setMinDistance(qreal minDistance);
    void setMaxDistance(qreal maxDistance);
    void setMinZoom(qreal minZoom);
    void setMaxZoom(qreal maxZoom);
    void setMinPolarAngle(qreal minPolarAngle);
    void setMaxPolarAngle(qreal maxPolarAngle);
    void setMinAzimuthAngle(qreal minAzimuthAngle);
    void setMaxAzimuthAngle(qreal maxAzimuthAngle);
    void setEnableDamping(bool enableDamping);
    void setDampingFactor(qreal dampingFactor);
    void setMaxClickTimeInterval(qreal maxClickTimeInterval);

    void frameTriggered();
    void reset();
    void straighten();
    void moveTo(QVector3D coords, qreal currentHeight);

signals:
    void mapChanged();
    void cameraChanged();
    void viewportChanged();
    void targetChanged();
    void minDistanceChanged();
    void maxDistanceChanged();
    void minZoomChanged();
    void maxZoomChanged();
    void minPolarAngleChanged();
    void maxPolarAngleChanged();
    void minAzimuthAngleChanged();
    void maxAzimuthAngleChanged();
    void enableDampingChanged();
    void dampingFactorChanged();
    void maxClickTimeIntervalChanged();

    void updated();

private slots:
    void onMouseDown(Qt3DInput::QMouseEvent *mouse);
    void onMouseMove(Qt3DInput::QMouseEvent *mouse);
    void onMouseUp(Qt3DInput::QMouseEvent *mouse);
    void onMouseWheel(Qt3DInput::QWheelEvent *wheel);
    void onKeyDown(Qt3DInput::QKeyEvent *event);
    void onKeyUp(Qt3DInput::QKeyEvent *event);

private:
    void keyDownInterval();
    void needUpdateInterval();

    void rotateLeft(qreal angle);
    void rotateUp(qreal angle);

    void panLeft(qreal distance);
    void panUp(qreal ditance);

    void pan(qreal deltaX, qreal deltaY);
    void pan(qreal deltaX, qreal deltaY, qreal screenWidth, qreal screenHeight);

    void dollyIn(qreal dollyScale);
    void dollyOut(qreal dollyScale);

    bool update();

    qreal getAutoRotationAngle();

    qreal getZoomScale(qreal delta);

    JSTimer* timer;

    //! Map
    Map* mMap;
    //! Camera that is being controlled
    Qt3DRender::QCamera* mCamera;
    //! used for computation of translation when dragging mouse
    QRect mViewport;
    //! Camera target point
    QVector3D mTarget;

    qreal mMinDistance;
    qreal mMaxDistance;

    int mMinZoom;
    int mMaxZoom;

    qreal mMinPolarAngle;
    qreal mMaxPolarAngle;

    qreal mMinAzimuthAngle;
    qreal mMaxAzimuthAngle;

    bool mEnableDamping;
    qreal mDampingFactor;

    qreal mMaxClickTimeInterval;
    bool mEnableMoveMarker;

    QTime mLastMove;
    QTime mLastClick;

    int mNeedsUpdate;
    QTimer* needUpdateTimer;

    QVector3D defaultTarget;
    QVector3D defaultPosition;
    qreal defaultZoom;

    QVector3D offset;
    QQuaternion quat;
    QQuaternion quatInverse;
    QVector3D lastPosition;
    QQuaternion lastQuaternion;


    bool enableZoom;
    qreal zoomSpeed;
    bool enableRotate;
    qreal rotateSpeed;
    bool enablePan;
    qreal keyPanSpeed;

    int keyDown;
    QTimer* keyDownTimer;

    bool autoRotate;
    qreal autoRotateSpeed;
    bool enableKeys;

    QVector2D rotateStart;
    QVector2D rotateEnd;
    QVector2D rotateDelta;
    QVector2D panStart;
    QVector2D panEnd;
    QVector2D panDelta;
    QVector2D dollyStart;
    QVector2D dollyEnd;
    QVector2D dollyDelta;

    enum State
    {
        None,
        Rotate,
        Dolly,
        Pan,
        TouchRotate,
        TouchDolly,
        TouchPan,
        MoveMarkerXY,
        MoveMarkerHeight,
    };
    State state;

    qreal EPS = 0.000001;

    // internal
    qreal theta;
    qreal phi;

    qreal phiDelta;
    qreal thetaDelta;
    qreal scale;
    QVector3D panOffset;
    bool zoomChanged;

    //! Delegates mouse events to the attached MouseHandler objects
    Qt3DInput::QMouseDevice* mMouseDevice;

    Qt3DInput::QKeyboardDevice* mKeyboardDevice;

    Qt3DInput::QMouseHandler* mMouseHandler;

    Qt3DInput::QKeyboardHandler* mKeyboardHandler;

    //! Allows us to define a set of actions that we wish to use
    //! (it is a component that can be attached to 3D scene)
//    Qt3DInput::QLogicalDevice* mLogicalDevice;

//    Qt3DInput::QAction* mLeftMouseButtonAction;
//    Qt3DInput::QActionInput* mLeftMouseButtonInput;
//    Qt3DInput::QAction* mMiddleMouseButtonAction;
//    Qt3DInput::QActionInput* mMiddleMouseButtonInput;
//    Qt3DInput::QAction* mRightMouseButtonAction;
//    Qt3DInput::QActionInput* mRightMouseButtonInput;

//    Qt3DInput::QAction* mShiftAction;
//    Qt3DInput::QActionInput* mShiftInput;
//    Qt3DInput::QAction* mControlAction;
//    Qt3DInput::QActionInput* mControlInput;

//    Qt3DInput::QAxis* mWheelAxis;
//    Qt3DInput::QAnalogAxisInput* mMouseWheelInput;

//    Qt3DInput::QAxis* mTxAxis;
//    Qt3DInput::QAxis* mTyAxis;
//    Qt3DInput::QButtonAxisInput* mKeyboardTxPosInput;
//    Qt3DInput::QButtonAxisInput* mKeyboardTyPosInput;
//    Qt3DInput::QButtonAxisInput* mKeyboardTxNegInput;
//    Qt3DInput::QButtonAxisInput* mKeyboardTyNegInput;
};

#endif // CAMERACONTROLLER_H
