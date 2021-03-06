// This is a modified version of the Metaballs example from the paper.js site:
// http://paperjs.org/examples/meta-balls/
// with animations from the creating animations tutorial
// http://paperjs.org/tutorials/animation/creating-animations/#moving-multiple-items

// generate black balls
project.currentStyle = {
    fillColor: 'black'
};


var handle_len_rate = 2.4;
var circlePaths = [];

// The amount of circles we want to make:
var count = 25;

// Create a symbol, which we will use to place instances of later:
var path = new Path.Circle(new Point(0, 0), 10);
path.style = {
    fillColor: 'black'
    // strokeColor: 'black'
};

var symbol = new Symbol(path);

// Place the instances of the symbol:
for (var i = 0; i < count; i++) {
    // The center position is a random point in the view:
    var center = Point.random() * view.size;
    if (center.y > (view.size._height - 10*i/count)) {
        center.y = (view.size._height - 10*i/count);
    } else if (center.y < 10*(i/count)) {
        center.y = 10*(i/count);
    }
    var placedSymbol = symbol.place(center);
    placedSymbol.scale(i / count);
}

// circlePaths.push(largeCircle);

var connections;

function generateConnections(paths) {
    if (connections)
        connections.remove();
    connections = new Group();
    for (var i = 0, l = paths.length; i < l; i++) {
        for (var j = i - 1; j >= 0; j--) {
            var path = metaball(paths[i], paths[j], 0.40, handle_len_rate, 220);
            if (path) {
                connections.appendTop(path);
                path.removeOnMove();
            }
        }
    }
}

generateConnections(circlePaths);

// ---------------------------------------------
function metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
    var center1 = ball1.position;
    var center2 = ball2.position;
    var radius1 = ball1.bounds.width / 2;
    var radius2 = ball2.bounds.width / 2;
    var pi2 = Math.PI / 2;
    var d = center1.getDistance(center2);
    var u1, u2;

    if (radius1 == 0 || radius2 == 0)
        return;

    if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
        return;
    } else if (d < radius1 + radius2) { // case circles are overlapping
        u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
                (2 * radius1 * d));
        u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
                (2 * radius2 * d));
    } else {
        u1 = 0;
        u2 = 0;
    }

    var angle1 = (center2 - center1).getAngleInRadians();
    var angle2 = Math.acos((radius1 - radius2) / d);
    var angle1a = angle1 + u1 + (angle2 - u1) * v;
    var angle1b = angle1 - u1 - (angle2 - u1) * v;
    var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
    var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
    var p1a = center1 + getVector(angle1a, radius1);
    var p1b = center1 + getVector(angle1b, radius1);
    var p2a = center2 + getVector(angle2a, radius2);
    var p2b = center2 + getVector(angle2b, radius2);

    // define handle length by the distance between
    // both ends of the curve to draw
    var totalRadius = (radius1 + radius2);
    var d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

    // case circles are overlapping:
    d2 *= Math.min(1, d * 2 / (radius1 + radius2));

    radius1 *= d2;
    radius2 *= d2;

    var path = new Path([p1a, p2a, p2b, p1b]);
    path.style = ball1.style;
    path.closed = true;
    var segments = path.segments;
    segments[0].handleOut = getVector(angle1a - pi2, radius1);
    segments[1].handleIn = getVector(angle2a + pi2, radius2);
    segments[2].handleOut = getVector(angle2b - pi2, radius2);
    segments[3].handleIn = getVector(angle1b + pi2, radius1);
    return path;
}

// ------------------------------------------------
function getVector(radians, length) {
    return new Point({
        // Convert radians to degrees:
        angle: radians * 180 / Math.PI,
        length: length
    });
}


// var xspeed = 1;
// var yspeed = 2;


function onFrame(event) {
    // largeCircle.translate(xspeed, yspeed);
    // generateConnections(circlePaths);
    generateConnections(project.activeLayer.children);

    for (var i = 0; i < count; i++) {
        var item = project.activeLayer.children[i];
        
        // Move the item 1/20th of its width to the right. This way
        // larger circles move faster than smaller circles:
        item.position.x += item.bounds.width / 50;

        // If the item has left the view on the right, move it back
        // to the left:
        if (item.bounds.left > view.size.width) {
            item.position.x = -item.bounds.width;
        }
    }
}