function setView(controls,location) {
    var hash = location
        .replace('#','')
        .split('/').map(
            function(str){
                return parseFloat(str)
            }
        );
    if (hash.length === 5){
        [zoom, lat, lng, bearing, pitch] = hash
        var pxCoords = project([lng,lat]);
        controls.target.copy(pxCoords);

        var distance = Math.pow(0.5,(zoom-4))*12000;
        bearing = radicalize(bearing);
        pitch = radicalize(pitch);
        var c={};
        c.x = pxCoords.x-Math.sin(bearing)*Math.sin(pitch)*distance;
        c.z = pxCoords.z+Math.cos(bearing)*Math.sin(pitch)*distance;

        c.y = Math.cos(pitch)*distance
        controls.object.position.copy(c)
    }
}
