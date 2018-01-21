#ifndef CAMERACONTROLLER_H
#define CAMERACONTROLLER_H

#include <Qt3DCore>
#include <Qt3DInput>
#include <Qt3DRender>
#include <QMetaObject>
#include <jstimer.h>

class Map;

class CameraController : public Qt3DCore::QEntity
{
    Q_OBJECT
    Q_PROPERTY(Map *map READ map WRITE setMap NOTIFY mapChanged)
    Q_PROPERTY(Qt3DRender::QCamera *camera READ camera WRITE setCamera NOTIFY cameraChanged)
    Q_PROPERTY(QRect viewport READ viewport WRITE setViewport NOTIFY viewportChanged)
    Q_PROPERTY(QVector3D target READ target WRITE setTarget NOTIFY targetChanged)
    Q_PROPERTY(float minDistance READ minDistance WRITE setMinDistance NOTIFY minDistanceChanged)
    Q_PROPERTY(float maxDistance READ maxDistance WRITE setMaxDistance NOTIFY maxDistanceChanged)
    Q_PROPERTY(int minZoom READ minZoom WRITE setMinZoom NOTIFY minZoomChanged)
    Q_PROPERTY(int maxZoom READ maxZoom WRITE setMaxZoom NOTIFY maxZoomChanged)
    Q_PROPERTY(float minPolarAngle READ minPolarAngle WRITE setMinPolarAngle NOTIFY minPolarAngleChanged)
    Q_PROPERTY(float maxPolarAngle READ maxPolarAngle WRITE setMaxPolarAngle NOTIFY maxPolarAngleChanged)
    Q_PROPERTY(float minAzimuthAngle READ minAzimuthAngle WRITE setMinAzimuthAngle NOTIFY minAzimuthAngleChanged)
    Q_PROPERTY(float maxAzimuthAngle READ maxAzimuthAngle WRITE setMaxAzimuthAngle NOTIFY maxAzimuthAngleChanged)
    Q_PROPERTY(bool enableDamping READ enableDamping WRITE setEnableDamping NOTIFY enableDampingChanged)
    Q_PROPERTY(float dampingFactor READ dampingFactor WRITE setDampingFactor NOTIFY dampingFactorChanged)
public:
    CameraController(Qt3DCore::QNode *parent = nullptr);

    Map *map() const { return mMap; }
    Qt3DRender::QCamera *camera() const { return mCamera; }
    QRect viewport() const { return mViewport; }
    QVector3D target() const { return mTarget; }
    float minDistance() const { return mMinDistance; }
    float maxDistance() const { return mMaxDistance; }
    int minZoom() const { return mMinZoom; }
    int maxZoom() const { return mMaxZoom; }
    float minPolarAngle() const { return mMinPolarAngle; }
    float maxPolarAngle() const { return mMaxPolarAngle; }
    float minAzimuthAngle() const { return mMinAzimuthAngle; }
    float maxAzimuthAngle() const { return mMaxAzimuthAngle; }
    bool enableDamping() const { return mEnableDamping; }
    float dampingFactor() const { return mDampingFactor; }

    void setMap(Map* map);
    void setCamera(Qt3DRender::QCamera *camera);
    void setViewport(const QRect& viewport);
    void setTarget(QVector3D target);
    void setMinDistance(float minDistance);
    void setMaxDistance(float maxDistance);
    void setMinZoom(float minZoom);
    void setMaxZoom(float maxZoom);
    void setMinPolarAngle(float minPolarAngle);
    void setMaxPolarAngle(float maxPolarAngle);
    void setMinAzimuthAngle(float minAzimuthAngle);
    void setMaxAzimuthAngle(float maxAzimuthAngle);
    void setEnableDamping(bool enableDamping);
    void setDampingFactor(float dampingFactor);

    void frameTriggered();
    void reset();
    void straighten();
    void moveTo(QVector3D coords, float currentHeight);

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

    void rotateLeft(float angle);
    void rotateUp(float angle);

    void panLeft(float distance);
    void panUp(float ditance);

    void pan(float deltaX, float deltaY);
    void pan(float deltaX, float deltaY, float screenWidth, float screenHeight);

    void dollyIn(float dollyScale);
    void dollyOut(float dollyScale);

    bool update();

    float getAutoRotationAngle();

    float getZoomScale(float delta);

    JSTimer* timer;

    //! Map
    Map* mMap;
    //! Camera that is being controlled
    Qt3DRender::QCamera* mCamera;
    //! used for computation of translation when dragging mouse
    QRect mViewport;
    //! Camera target point
    QVector3D mTarget;

    float mMinDistance;
    float mMaxDistance;

    int mMinZoom;
    int mMaxZoom;

    float mMinPolarAngle;
    float mMaxPolarAngle;

    float mMinAzimuthAngle;
    float mMaxAzimuthAngle;

    bool mEnableDamping;
    float mDampingFactor;

    QTime mLastMove;

    int mNeedsUpdate;
    QTimer* needUpdateTimer;

    QVector3D defaultTarget;
    QVector3D defaultPosition;
    float defaultZoom;

    QVector3D offset;
    QQuaternion quat;
    QQuaternion quatInverse;
    QVector3D lastPosition;
    QQuaternion lastQuaternion;


    bool enableZoom;
    float zoomSpeed;
    bool enableRotate;
    float rotateSpeed;
    bool enablePan;
    float keyPanSpeed;

    int keyDown;
    QTimer* keyDownTimer;

    bool autoRotate;
    float autoRotateSpeed;
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
    };
    State state;

    float EPS = 0.000001;

    // internal
    float theta;
    float phi;

    float phiDelta;
    float thetaDelta;
    float scale;
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
