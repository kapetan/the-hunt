var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');
var Base = require('./base');
var FootTrack = require('./foot-track');
var Bullet = require('./bullet');

var SIZE = { width: 20, height: 20 };
var ROTATION_SPEED = Math.PI / 800;
var MOVING_SPEED = 0.1;
var LINE_OF_SIGHT = 90;
var LINE_OF_SIGHT_EDGE = 10;
var RELOAD_SPEED = 0.001;

var toJSON = function(obj, properties) {
	var json = properties.reduce(function(acc, name) {
		acc[name] = obj[name];
		return acc;
	}, {});

	return JSON.parse(JSON.stringify(json));
};

var Player = function(game, controller, options) {
	options = extend({
		size: SIZE,
		direction: 0,
		visibility: 1,
		speed: MOVING_SPEED,
		lineOfSight: LINE_OF_SIGHT,
		reloadSpeed: RELOAD_SPEED,
		ammunition: 1
	}, options || {});

	Base.call(this, game, options);

	this.controller = controller;

	this.active = false;
	this.collidable = true;

	this.speed = options.speed;
	this.lineOfSight = options.lineOfSight;
	this.reloadSpeed = options.reloadSpeed;
	this.ammunition = options.ammunition;

	this.footTrack = new FootTrack(game, this);
};

util.inherits(Player, Base);

Player.prototype.update = function(dt) {
	this.footTrack.update(dt);
	if(this.ammunition < 1) this.ammunition += this.reloadSpeed * dt;

	var controller = this.controller;
	var position = this.position;
	var size = this.size;

	var next = { x: position.x, y: position.y, direction: this.direction };

	if(controller.action('shoot') && this.ammunition >= 1) {
		var bullet = new Bullet(this.game, this);

		this.ammunition = 0;
		this.game.addBody(bullet);
	}
	if(controller.action('left')) {
		next.direction = this.direction - ROTATION_SPEED * dt;
	}
	if(controller.action('right')) {
		next.direction = this.direction + ROTATION_SPEED * dt;
	}
	if(controller.action('up')) {
		var t = math.translate(position, this.direction, this.speed * dt);
		next.x = t.x;
		next.y = t.y;
	}
	if(controller.action('down')) {
		var t = math.translate(position, this.direction + Math.PI, this.speed * dt);
		next.x = t.x;
		next.y = t.y;
	}

	var bounds = new Rectangle(next, this.size, next.direction);

	if(!this.game.inBounds(bounds)) return;
	if(this.game.getCollisions(bounds, [this]).length) return;

	this.position.x = next.x;
	this.position.y = next.y;
	this.direction = next.direction;
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
	return toJSON(this, ['position', 'size', 'direction', 'visibility', 'speed', 'lineOfSight', 'reloadSpeed', 'ammunition']);
};

module.exports = Player;
