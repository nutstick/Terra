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
