Qt.include("three.js")
Qt.include("/lib/OrbitControls.js")

//var include = {
//    init: false,
//    mapbox: false,
//}

///* SphericalMercator */
//Qt.include("sm.js")
///* Mapbox */
//Qt.include("https://api.tiles.mapbox.com/mapbox.js/v2.1.9/mapbox.js", function() {
//    include.mapbox = true;
//});

var camera, scene, renderer, controller;
var cube;

var raycaster;

function getZoom(){
    var pt = controls.target.distanceTo(controls.object.position);
    return Math.min(
        Math.max(
            getBaseLog(0.5, pt/12000)+4,
            0
        )
    ,22);
}

function updateTiles(){
    zoom = Math.floor(getZoom());

    var ul = {x:-1,y:-1,z:-1};
    var ur = {x:1,y:-1,z:-1};
    var lr = {x:1,y:1,z:1};
    var ll = {x:-1,y:1,z:1};

    var corners = [ul, ur, lr, ll, ul].map(function(corner){
        raycaster.setFromCamera(corner, camera);
        return raycaster.intersectObject(plane)[0].point;
    })

    if (corners[0] === screenPosition) return;
    else screenPosition = corners[0];

    updater.postMessage([zoom,corners])

    setHash()
}


function initializeGL(canvas, eventSource) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    camera.position.z = 5;

    /*
    var camera = new THREE.PerspectiveCamera(70, width / height, 1/99, 100000000000000);
    camera.position.y = 12000;
    */
    console.log(canvas, camera, eventSource)
    console.log(THREE.OrbitControls)
    var controls = new THREE.OrbitControls( camera, eventSource, canvas );

    raycaster = new THREE.Raycaster();

    var material = new THREE.MeshBasicMaterial({ color: 0x80c342,
                                                   shading: THREE.SmoothShading });
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    cube = new THREE.Mesh(cubeGeometry, material);
    cube.rotation.set(0.785, 0.785, 0.0);
    scene.add(cube);

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);
}

function resizeGL(canvas) {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
}

function paintGL(canvas) {
    // controls.update();
    renderer.render(scene, camera);
}
