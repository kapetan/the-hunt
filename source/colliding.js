var subtract = function(p1, p2) {
	return { x: p1.x - p2.x, y: p1.y - p2.y };
};

var min = function(arr) {
	return Math.min.apply(null, arr);
};

var max = function(arr) {
	return Math.max.apply(null, arr);
};

var project = function(vector, target) {
	var x = target.x;
	var y = target.y;

	var s = dot(vector, target) / (x * x + y * y);

	return { x: s * x, y: s * y };
};

var dot = function(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
};

var projectRectangle = function(axis, points) {
	return points.map(function(point) {
		return project(point, axis);
	});
};

var isOverlaping = function(axis, p1, p2) {
	var scalar = function(v) {
		return dot(axis, v);
	};

	var sr1 = projectRectangle(axis, p1).map(scalar);
	var sr2 = projectRectangle(axis, p2).map(scalar);

	return min(sr2) <= max(sr1) && max(sr2) >= min(sr1);
};

module.exports = function(p1, p2) {
	return isOverlaping(subtract(p1[0], p1[1]), p1, p2) &&
		isOverlaping(subtract(p1[1], p1[2]), p1, p2) &&
		isOverlaping(subtract(p2[0], p2[1]), p1, p2) &&
		isOverlaping(subtract(p2[1], p2[2]), p1, p2);
};
