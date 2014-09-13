var EPSILON = Math.pow(10, -5);

var equal = function(number, target) {
	return (target - EPSILON) < number && number < (target + EPSILON);
};

module.exports = function(point, direction, polygon) {
	var intersections = [];

	var x00 = point.x;
	var y00 = point.y;
	var x01 = direction.x;
	var y01 = direction.y;

	polygon.forEach(function(current, i) {
		var j = (i === polygon.length - 1) ? 0 : (i + 1);
		var next = polygon[j];

		var x10 = current.x;
		var y10 = current.y;
		var x11 = next.x - current.x;
		var y11 = next.y - current.y;

		var ux = x00 - x10;
		var uy = y00 - y10;

		if(equal(ux, 0) && equal(uy, 0)) {
			return intersections.push({ x: x00, y: y00 });
		}

		var det = x11 * y01 - x01 * y11;

		if(equal(det, 0)) {
			// Almost parallel
			return;
		}

		var inverse = 1 / det;
		var s = inverse * (ux * y01 - uy * x01);
		var t = inverse * (ux * y11 - uy * x11);

		var it = equal(t, 0) || t > 0;
		var is = (equal(s, 0) || s > 0) && (equal(s, 1) || s < 1);

		if(it && is) {
			intersections.push({ x: x00 + x01 * t, y: y00 + y01 * t });
		}
	});

	return intersections;
};
