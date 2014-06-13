var util = require('util');

var math = require('../math');
var Base = require('../bodies/base');

var PILLAR_NORMAL_SIZE = { width: 13, height: 13 };
var PILLAR_MEDIUM_SIZE = { width: 15, height: 15 };
var WALL_WIDTH = 6;

var Wall = function() {
	Base.apply(this, arguments);

	this.active = false;
	this.collidable = true;
};

util.inherits(Wall, Base);

var wall = function(game, point, segments) {
	var points = [point];
	var current = point;

	segments.forEach(function(segment) {
		var wall = new Wall(game, {
			position: math.translate(current, segment.direction, segment.length / 2),
			size: { width: segment.length, height: WALL_WIDTH },
			direction: segment.direction
		});

		game.addBody(wall);
		current = math.translate(current, segment.direction, segment.length);
		points.push(current);
	});

	points.forEach(function(point, i) {
		var prev = points[i - 1] || point;
		var next = points[i + 1] || point;
		var end = !i || i === points.length - 1;

		prev = math.normalize({ x: prev.x - point.x, y: prev.y - point.y });
		next = math.normalize({ x: next.x - point.x, y: next.y - point.y });

		var d = math.direction({ x: next.x + prev.x, y: next.y + prev.y });
		var pillar = new Wall(game, {
			position: point,
			size: end ? PILLAR_MEDIUM_SIZE : PILLAR_NORMAL_SIZE,
			direction: d.radians
		});

		game.addBody(pillar);
	});

	return points[points.length - 1];
};

module.exports = wall;
