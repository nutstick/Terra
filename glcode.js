Qt.include("three.js");
Qt.include("/lib/OrbitControls.js");
Qt.include("/lib/utilities.js");
Qt.include("/lib/image.js");

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

var debug = true;

var camera, scene, renderer, controls;
var cube, plane;
var raycaster;
var firstTime = true;
var meshes = 0;
var parserRequests = 0;
var updaterRequests = 0;
var finished = 0;
//compass functionality
var screenPosition;
var markers = [];

var basePlaneDimension = 65024;

function getZoom() {
    var pt = controls.target.distanceTo(controls.object.position);
    return Math.min(Math.max(getBaseLog(0.5, pt/12000)+4, 0) ,22);
}

function addMarker( position ) {

    var picker = new THREE.Raycaster();

    picker.setFromCamera(position, camera);

    var markerPosition = picker.intersectObject(plane)[0].point;

    var markerGeometry = new THREE.CylinderGeometry( 3, 3, 8, 8, 1 );

    for (var i = 0; i < markerGeometry.vertices.length; i++) {
        markerGeometry.vertices[i].y += 8;
    }

    var lineGeometry = new THREE.Geometry();

    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometry.vertices.push(new THREE.Vector3(0, 8, 0));

    var marker = {
        head: new THREE.Mesh(
            markerGeometry,
            new THREE.MeshBasicMaterial({ color: 0x3366ff, opacity: 0.8, transparent: true })
        ),
        vLine: new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3, transparent: true, opacity: 0.8 })
        )
    }

    marker.setOffsetY = function(delta) {

        this.head.position.y += delta;
        this.vLine.geometry.vertices[1].y = this.head.position.y;

    }

    marker.setScale = function(scale) {

        this.head.scale.set(scale, scale, scale);

        this.vLine.scale.set(scale, scale, scale);

    }

    marker.head.position.copy(markerPosition);
    marker.vLine.position.copy(markerPosition);

    markers.push(marker);
    scene.add(marker.head);
    scene.add(marker.vLine);

    return marker;

}

function assembleUrl(img, coords) {
    var tileset = img ? 'mapbox.streets-satellite' : 'mapbox.terrain-rgb';//
    var res = img ? '@2x.png' :'@2x.pngraw';

    //domain sharding
    var serverIndex = 2*(coords[1]%2)+coords[2]%2
    var server = ['a','b','c','d'][serverIndex]
    //return 'sample.png'
    return 'https://'+server+'.tiles.mapbox.com/v4/'+tileset+'/'+slashify(coords)+res+'?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg'
}

function updateTiles() {
    var zoom = Math.floor(getZoom());

    var ul = { x:-1, y:-1, z:-1 };
    var ur = { x:1, y:-1, z:-1 };
    var lr = { x:1, y:1, z:1 };
    var ll = { x:-1, y:1, z:1 };

    var corners = [ul, ur, lr, ll, ul].map(function(corner){
        raycaster.setFromCamera(corner, camera);
        return raycaster.intersectObject(plane)[0].point;
    })

    if (corners[0] === screenPosition) return;
    else screenPosition = corners[0];

    updater.sendMessage([zoom, corners])

    // TODO location handle inside qml
    // setHash()
}

// given a list of elevation and imagery tiles, download
function getTiles(data) {
    var tiles = data[0];
    var elevation = data[1];

    progress.opacity = 1;

    if (debug) {
        canvas3d.tilesToGet += tiles.length;
        updaterRequests += tiles.length;

        tiles.forEach(function(tile) {
            makeMesh([[], tile]);
        });
    } else {
        tiles = tiles.map(function(tile) { return slashify(tile); });

        canvas3d.tilesToGet += tiles.length;
        updaterRequests += tiles.length

        tiles.forEach(function(tile) {
            makeMesh([[], tile]);
        })

        elevation.forEach(function(coords) {

            //download the elevation image
            getPixels(assembleUrl(null, coords), function(err, pixels) {
                // usually a water tile-- fill with 0 elevation
                if (err) pixels = null;
                parser.sendMessage([pixels, coords, tiles]);
            });
        })
    }
}

function onTileReady(coords, err, pixels) {
    if (err) pixels = null
    var parserIndex = 2*(coords[1]%2)+coords[2]%2
    parserPool[parserIndex]
        .sendMessage([pixels, coords, tiles,parserIndex])
}

function makeMesh(d) {
    var data = d[0];
    var x = d[1][1];
    var y = d[1][2];
    var z = d[1][0];

    meshes++;

    var tileSize = basePlaneDimension / (Math.pow(2, z));
    var vertices = 128;
    var segments = vertices-1;

    // get image to drape
    if (debug) {
        var texture = new THREE.TextureLoader()
        .load(
            // url
            assembleUrl(true, [z,x,y]),
            // onLoad function
            function(resp){
                canvas3d.tilesToGet--;
                finished++;

                scene.remove(placeholder);
                tile.visible=true;

                if (canvas3d.tilesToGet===0) {
                    progress.opacity = 0;
                    console.log('STABLE')
                    updateTileVisibility()
                }

            },
            // onProgress function
            function() {},
            // onError function
            function(err) {
                console.log(err)
            }
        );

        var material = new THREE.MeshBasicMaterial({ map: texture});

        var geometry = new THREE.PlaneGeometry(tileSize, tileSize);

        geometry.vertices = [
            new THREE.Vector3(-tileSize/2, 0, -tileSize/2),
            new THREE.Vector3(-tileSize/2, 0, tileSize/2),
            new THREE.Vector3(tileSize/2, 0, -tileSize/2),
            new THREE.Vector3(tileSize/2, 0, tileSize/2)
        ];
        geometry.faces = [
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(1, 3, 2)
        ];
        geometry.computeFaceNormals();

        var xOffset = (x+0.5)*tileSize - basePlaneDimension/2;
        var yOffset = (y+0.5)*tileSize - basePlaneDimension/2;

        geometry.translate(xOffset, 0, yOffset);

        var tile = new THREE.Mesh(geometry, material);

        tile.coords = slashify([z,x,y])
        tile.zoom = z;
        scene.add(tile)
        tile.visible=false
    } else {
        var texture = new THREE.TextureLoader()
        .load(
            // url
            assembleUrl(true, [z,x,y]),
            // onLoad function
            function(resp){
                canvas3d.tilesToGet--;
                finished++;

                scene.remove(placeholder);
                plane.visible=true;

                if (canvas3d.tilesToGet===0) {
                    progress.opacity = 0;
                    console.log('STABLE')
                    updateTileVisibility()
                }

            },
            // onProgress function
            function() {},
            // onError function
            function(err) {
                console.log(err)
            }
        );

        // set material
        var material = new THREE.MeshBasicMaterial({ map: texture });

        data = resolveSeams(data, neighborTiles,[z,x,y])
        var geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize, segments, segments);

        geometry.attributes.position.array = new Float32Array(data);

        var placeholder = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe:true,color:0x999999}));
        scene.add(placeholder);

        var plane = new THREE.Mesh(geometry, material);

        plane.coords = slashify([z,x,y])
        plane.zoom = z;
        scene.add(plane)
        plane.visible=false
    }
};

function updateTileVisibility() {
    var zoom = Math.floor(getZoom());
    //update tile visibility based on zoom
    // TODO: Performance optimize
    for (var s=0; s < scene.children.length; s++){
        var child = scene.children[s];
        if (child.zoom === zoom || child.zoom === undefined) child.visible = true;
        else child.visible = false;
    }
}

function initializeGL(canvas, eventSource) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, width / height, 1/99, 100000000000000);
    camera.position.z = 12000;

    controls = new THREE.OrbitControls( camera, eventSource, canvas );

    raycaster = new THREE.Raycaster();

    var basePlane = new THREE.PlaneBufferGeometry(basePlaneDimension*100, basePlaneDimension*100, 1, 1);
    var mat = new THREE.MeshBasicMaterial({
        wireframe: true,
        opacity:0
        //transparent: true
    });

    plane = new THREE.Mesh(basePlane, mat);
    plane.rotation.x = -0.5*Math.PI;
    plane.opacity=0;
    scene.add(plane);

    // ----
//    var material = new THREE.MeshBasicMaterial({ color: 0x80c342,
//                                                   shading: THREE.SmoothShading });
//    var cubeGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
//    cube = new THREE.Mesh(cubeGeometry, material);
//    scene.add(cube);

    // ---

//    clicked(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.Canvas3DRenderer({ canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);
}

function resizeGL(canvas) {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
}

function paintGL(canvas) {
    if (markers.length > 0) {

        var scaleFactor = 120;
        var scaleVector = new THREE.Vector3();
        var scale = camera.position.y / scaleFactor;

        for (var i = 0; i < markers.length; i++) {
            markers[i].setScale(scale);
        }
    }

    // controls.update();
    renderer.render(scene, camera);
}
