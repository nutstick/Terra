function pointInsidePolygon (polygon, pt) {
    // Ray-casting algorithm only 2D x-z
    var x = pt.x;
    var z = pt.z;
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i].x;
        var zi = polygon[i].z;
        var xj = polygon[j].x;
        var zj = polygon[j].z;

        var intersect = ((zi >= z) !== (zj >= z)) &&
            (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;

    // return inside([pt.x, pt.z], polygon.map(function (p) { return [p.x, p.z]; }));

    // return classifyPoint(polygon.map(function (p) { return [p.x, p.z]; }), [pt.x, pt.z]) < 1;
}

var eps = 0.0000001;
function between (a, b, c) {
    return a - eps <= b && b <= c + eps;
};

function lineIntersects (l1, l2) {
    var x1 = l1[0].x;
    var y1 = l1[0].z;
    var x2 = l1[1].x;
    var y2 = l1[1].z;
    var x3 = l2[0].x;
    var y3 = l2[0].z;
    var x4 = l2[1].x;
    var y4 = l2[1].z;

    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x) || isNaN(y)) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!between(x2, x, x1)) { return false; }
        } else {
            if (!between(x1, x, x2)) { return false; }
        }
        if (y1 >= y2) {
            if (!between(y2, y, y1)) { return false; }
        } else {
            if (!between(y1, y, y2)) { return false; }
        }
        if (x3 >= x4) {
            if (!between(x4, x, x3)) { return false; }
        } else {
            if (!between(x3, x, x4)) { return false; }
        }
        if (y3 >= y4) {
            if (!between(y4, y, y3)) { return false; }
        } else {
            if (!between(y3, y, y4)) { return false; }
        }
    }
    return true;
};

module.exports = {
    pointInsidePolygon: pointInsidePolygon,
    lineIntersects: lineIntersects
};
