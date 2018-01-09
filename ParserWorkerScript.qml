import QtQuick 2.0

import "glcode.js" as GLCode

WorkerScript {
    source: "/worker/parseelevation.js"

    onMessage: {
        var time = Date.now();
        canvas3d.parserRequests++
        if(messageObject.makeMesh) GLCode.makeMesh(messageObject.makeMesh)
        else console.log(messageObject)
    }
}
