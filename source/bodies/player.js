var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');
var Base = require('./base');
var FootTrack = require('./foot-track');

var SIZE = { width: 20, height: 20 };
var ROTATION_SPEED = Math.PI / 800;
var MOVING_SPEED = 0.1;
var LINE_OF_SIGHT = 90;
var LINE_OF_SIGHT_EDGE = 10;
var RELOAD_SPEED = 0.001;

var Player = function(game, options) {
	options = extend({
		size: SIZE,
		direction: 0,
		visibility: 1,
		speed: MOVING_SPEED,
		lineOfSight: LINE_OF_SIGHT,
		reloadSpeed: RELOAD_SPEED,
		ammunition: 1,
		active: false,
		collidable: true
	}, options);

	Base.call(this, game, options);

	this.active = options.active;
	this.collidable = options.collidable;

	this.id = options.id;
	this.speed = options.speed;
	this.lineOfSight = options.lineOfSight;
	this.reloadSpeed = options.reloadSpeed;
	this.ammunition = options.ammunition;

	this.footTrack = options.footTrack || new FootTrack(game, this);
};

util.inherits(Player, Base);

Player.prototype.update = function(dt) {
	this.footTrack.update(dt);
	if(this.ammunition < 1) this.ammunition += this.reloadSpeed * dt;
};

Player.prototype.processInput = function(input, dt) {
	var target = input.target;
	var position = this.position;

	var next = { x: position.x, y: position.y, direction: this.direction };

	if(target) {
		var d = math.direction({ x: target.x - position.x, y: target.y - position.y });

		next.direction = d.radians;
		next.x = position.x + d.x * this.speed * dt;
		next.y = position.y + d.y * this.speed * dt;
	} else {
		if(input.shoot && this.ammunition >= 1) {
			this.ammunition = 0;
		}
		if(input.left) {
			next.direction = this.direction - ROTATION_SPEED * dt;
		}
		if(input.right) {
			next.direction = this.direction + ROTATION_SPEED * dt;
		}
		if(input.up) {
			var t = math.translate(position, this.direction, this.speed * dt);
			next.x = t.x;
			next.y = t.y;
		}
		if(input.down) {
			var t = math.translate(position, this.direction + Math.PI, this.speed * dt);
			next.x = t.x;
			next.y = t.y;
		}
	}

	var bounds = new Rectangle(next, this.size, next.direction);

	if(!this.game.inBounds(bounds)) return;
	if(this.game.isColliding(bounds, this)) return;

	this.position.x = next.x;
	this.position.y = next.y;
	this.direction = next.direction;
};

Player.prototype.hasShot = function() {
	return !this.ammunition;
};

Player.prototype.visibilityOf = function(pointOrBody) {
	var d = this.distanceTo(pointOrBody);
	var inner = this.lineOfSight - LINE_OF_SIGHT_EDGE;
	var outer = this.lineOfSight + LINE_OF_SIGHT_EDGE;

	if(d > outer) return 0;
	if(d < inner) return 1;
	return (1 - (d - inner) / (outer - inner));
};

Player.prototype.toJSON = function() {
	return {
		id: this.id,
		position: { x: this.position.x, y: this.position.y },
		size: { width: this.size.width, height: this.size.height },
		direction: this.direction,
		visibility: this.visibility,
		speed: this.speed,
		lineOfSight: this.lineOfSight,
		reloadSpeed: this.reloadSpeed,
		ammunition: this.ammunition
	};
};

module.exports = Player;
