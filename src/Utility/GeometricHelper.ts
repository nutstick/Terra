const eps = 0.0000001;
function between(a, b, c) {
    return a - eps <= b && b <= c + eps;
}

export class GeometricHelper {
    static pointInsidePolygon(polygon, pt) {
        // Ray-casting algorithm only 2D x-z
        const x = pt.x;
        const z = pt.z;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const zi = polygon[i].z;
            const xj = polygon[j].x;
            const zj = polygon[j].z;

            const intersect = ((zi >= z) !== (zj >= z)) &&
                (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        return inside;

        // return inside([pt.x, pt.z], polygon.map(function (p) { return [p.x, p.z]; }));

        // return classifyPoint(polygon.map(function (p) { return [p.x, p.z]; }), [pt.x, pt.z]) < 1;
    }

    static lineIntersects(l1, l2) {
        const a = l1[0].x;
        const b = l1[0].z;
        const c = l1[1].x;
        const d = l1[1].z;
        const p = l2[0].x;
        const q = l2[0].z;
        const r = l2[1].x;
        const s = l2[1].z;
        let det;
        let gamma;
        let lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
          return false;
        } else {
          lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
          gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
          return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
        // const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
        //         ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
        // const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
        //         ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
        // if (isNaN(x) || isNaN(y)) {
        //     return false;
        // } else {
        //     if (x1 >= x2) {
        //         if (!between(x2, x, x1)) { return false; }
        //     } else {
        //         if (!between(x1, x, x2)) { return false; }
        //     }
        //     if (y1 >= y2) {
        //         if (!between(y2, y, y1)) { return false; }
        //     } else {
        //         if (!between(y1, y, y2)) { return false; }
        //     }
        //     if (x3 >= x4) {
        //         if (!between(x4, x, x3)) { return false; }
        //     } else {
        //         if (!between(x3, x, x4)) { return false; }
        //     }
        //     if (y3 >= y4) {
        //         if (!between(y4, y, y3)) { return false; }
        //     } else {
        //         if (!between(y3, y, y4)) { return false; }
        //     }
        // }
        // return true;
    }
}
