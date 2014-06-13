exports.translate = function(point, direction, length) {
	var x1 = Math.cos(direction) * length;
	var y1 = Math.sin(direction) * length;

	return {
		x: point.x + x1,
		y: point.y + y1
	};
};

exports.rotate = function(point, pivot, angle) {
	var x = point.x - pivot.x;
	var y = point.y - pivot.y;

	var cos = Math.cos(angle);
	var sin = Math.sin(angle);

	return {
		x: x * cos - y * sin + pivot.x,
		y: x * sin + y * cos + pivot.y
	};
};

exports.direction = function(vector) {
	var length = exports.length(vector);
	var radians = Math.acos(vector.x / length);

	if(vector.y < 0) radians = -radians;

	var unit = exports.normalize(vector);
	unit.radians = radians;

	return unit;
};

exports.distance = function(p1, p2) {
	var x = p2.x - p1.x;
	var y = p2.y - p1.y;

	return Math.sqrt(x * x + y * y);
};

exports.length = function(vector) {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
};

exports.normalize = function(vector) {
	var length = exports.length(vector);
	if(!length) return { x: 0, y: 0 };

	return {
		x: vector.x / length,
		y: vector.y / length
	};
};
