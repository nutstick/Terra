import QtQuick 2.0

import "map.js" as Map

WorkerScript {
    source: "/worker/parseelevation.js"

    onMessage: {
        var time = Date.now();
        canvas3d.parserRequests++
        if(messageObject.makeMesh) Map.makeMesh(messageObject.makeMesh)
        else console.log(messageObject)
    }
}
