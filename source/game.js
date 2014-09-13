var events = require('events');
var util = require('util');

var Rectangle = require('./bodies/rectangle');

var math = require('./math');
var append = require('./utils/append');
var remove = require('./utils/remove');

var Game = function(size, level) {
	events.EventEmitter.call(this);

	this.size = size;
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);
	this.bodies = [];

	this._running = false;
	this._add = [];
	this._remove = [];

	this.level = level(this);
};

util.inherits(Game, events.EventEmitter);

Game.prototype.start = function() {
	this._running = true;
};

Game.prototype.stop = function() {
	this._running = false;
};

Game.prototype.update = function(dt) {
	append(this.bodies, this._add);
	remove(this.bodies, this._remove);

	this._add = [];
	this._remove = [];

	this.bodies.forEach(function(body) {
		body.update(dt);
	});
};

Game.prototype.addBody = function(body) {
	if(this._running) this._add.push(body);
	else this.bodies.push(body);
};

Game.prototype.removeBody = function(body) {
	if(this._running) this._remove.push(body);
	else remove(this.bodies, body);
};

Game.prototype.isColliding = function(rectangle, ignore) {
	return this.bodies.some(function(body) {
		if(ignore && ignore.indexOf(body) >= 0) return false;
		return body.collidable && rectangle.isColliding(body.getRectangle());
	});
};

Game.prototype.inBounds = function(rectangle) {
	return this.bounds.isRectangleInside(rectangle);
};

Game.prototype.hitscan = function(source) {
	var position = source.position;
	var direction = source.direction;

	var hit;
	var distance;
	var body;

	this.bodies.forEach(function(b) {
		if(b === source || !b.collidable) return;

		var rectangle = b.getRectangle();
		var intersections = rectangle.getIntersections(position, direction);

		if(!intersections.length) return;

		intersections.forEach(function(p) {
			var d = math.distance(position, p);

			if(distance === undefined || d < distance) {
				hit = p;
				distance = d;
				body = b;
			}
		});
	});

	if(!hit) hit = this.bounds.getIntersections(position, direction)[0];

	return {
		position: hit,
		body: body && body.id
	};
};

module.exports = Game;
