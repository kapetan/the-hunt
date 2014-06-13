var math = require('../math');
var colliding = require('../colliding');

var getPoints = function(position, size, direction) {
	// width = width / 2;
	// height = height / 2;

	// var fx = Math.cos(direction) * width;
	// var fy = Math.sin(direction) * width;

	// var dx = Math.cos(direction + Math.PI / 2) * height;
	// var dy = Math.sin(direction + Math.PI / 2) * height;

	// return [
	// 	{ x: x + fx + dx, y: y + fy + dy },
	// 	{ x: x + fx - dx, y: y + fy - dy },
	// 	{ x: x - fx - dx, y: y - fy - dy },
	// 	{ x: x - fx + dx, y: y - fy + dy }
	// ];

	var x = position.x;
	var y = position.y;

	var w = size.width / 2;
	var h = size.height / 2;

	return [
		{ x: x + w, y: y + h },
		{ x: x + w, y: y - h },
		{ x: x - w, y: y - h },
		{ x: x - w, y: y + h }
	].map(function(point) {
		return math.rotate(point, position, direction);
	});
};

var getBoundingRectangle = function(points) {
	var maxX, minX, maxY, minY;

	points.forEach(function(point) {
		if(maxX === undefined || point.x > maxX) maxX = point.x;
		if(minX === undefined || point.x < minX) minX = point.x;
		if(maxY === undefined || point.y > maxY) maxY = point.y;
		if(minY === undefined || point.y < minY) minY = point.y;
	});

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
};

var Rectangle = function(position, size, direction) {
	this.position = position;
	this.size = size;
	this.direction = direction;

	this.points = getPoints(position, size, direction);
	this.bounding = getBoundingRectangle(this.points);
};

Rectangle.aligned = function(position, size) {
	return new Rectangle({ x: position.x + size.width / 2, y: position.y + size.height / 2 }, size, 0);
};

Rectangle.prototype.isColliding = function(rectangle) {
	// var self = this;

	// return (this.points.some(function(point) {
	// 	return rectangle.isPointInside(point);
	// }) || rectangle.points.some(function(point) {
	// 	return self.isPointInside(point);
	// }));

	return colliding(this.points, rectangle.points);
};

Rectangle.prototype.isRectangleInside = function(rectangle) {
	var self = this;

	return rectangle.points.every(function(point) {
		return self.isPointInside(point);
	});
};

Rectangle.prototype.isPointInside = function(point) {
	point = math.rotate(point, this.position, 2 * Math.PI - this.direction);

	var x = this.position.x - this.size.width / 2;
	var y = this.position.y - this.size.height / 2;

	return (x <= point.x && point.x <= x + this.size.width) && (y <= point.y && point.y <= y + this.size.height);
};

module.exports = Rectangle;
