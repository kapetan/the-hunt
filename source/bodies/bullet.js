var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Base = require('./base');
var Rectangle = require('./rectangle');

var RADIUS = 3;
var SPEED = 0.8;
var HIT_TOLERANCE = Math.pow(10, -1);

var PARTICLE_COUNT = 10;
var MIN_PARTICLE_SIZE = 5;
var MAX_PARTICLE_SIZE = 10;
var MIN_PARTICLE_SPEED = 0.06;
var MAX_PARTICLE_SPEED = 0.2;
var MIN_PARTICLE_SCALE = 0.01;
var MAX_PARTICLE_SCALE = 0.04;
var MIN_PARTICLE_ANGLE = -0.1;
var MAX_PARTICLE_ANGLE = 0.1;

var rand = function(min, max) {
	return min + Math.random() * (max - min);
};

var explosion = function(game, position, color) {
	for(var i = 0; i < 2 * Math.PI; i += Math.round(2 * Math.PI / PARTICLE_COUNT)) {
		var size = rand(MIN_PARTICLE_SIZE, MAX_PARTICLE_SIZE);
		var scale = rand(MIN_PARTICLE_SCALE, MAX_PARTICLE_SCALE);
		var speed = rand(MIN_PARTICLE_SPEED, MAX_PARTICLE_SPEED);
		var direction = i + rand(MIN_PARTICLE_ANGLE, MAX_PARTICLE_ANGLE);

		var particle = new Particle(game, {
			position: { x: position.x, y: position.y },
			size: { width: size, height: size },
			direction: direction,
			color: color,
			scale: scale,
			speed: speed
		});

		game.addBody(particle);
	}
};

var Particle = function(game, options) {
	Base.call(this, game, options);

	this.active = true;
	this.collidable = false;

	this.speed = options.speed;
	this.scale = options.scale;
};

util.inherits(Particle, Base);

Particle.prototype.update = function(dt) {
	var next = math.translate(this.position, this.direction, this.speed * dt);

	this.position.x = next.x;
	this.position.y = next.y;

	this.size.width -= this.scale * dt;
	this.size.height -= this.scale * dt;

	if(!this.isVisible()) this.game.removeBody(this);
};

Particle.prototype.isVisible = function() {
	return this.size.width > 0 && this.size.height > 0;
};

var Bullet = function(game, player, hit, options) {
	this.game = game;
	this.player = player;
	this.hit = hit;


	options = extend({
		position: player.position,
		direction: player.direction,
		visibility: 1
	}, options);

	var position = math.translate(options.position, options.direction, (player.size.width + RADIUS) / 2);

	this.collidable = false;
	this.active = true;

	this.position = position;
	this.direction = options.direction;
	this.visibility = options.visibility;
};

Bullet.prototype.update = function(dt) {
	var d = math.distance(this.position, this.hit);

	if(d < HIT_TOLERANCE) {
		this.explode();
	} else {
		this.move(dt);
	}
};

Bullet.prototype.move = function(dt) {
	var next = math.translate(this.position, this.direction, SPEED * dt);
	var dp = math.distance(this.position, this.hit);
	var dn = math.distance(next, this.hit);

	if(dp < dn) next = this.hit;

	this.position.x = next.x;
	this.position.y = next.y;
};

Bullet.prototype.explode = function() {
	explosion(this.game, this.position, [0, 0, 0]);
	explosion(this.game, this.position, [255, 163, 18]);

	this.game.removeBody(this);
};

Bullet.prototype.draw = function(options) {
	var canvas = this.game.canvas;

	options = extend(this, options);

	canvas.save();
	canvas.beginPath();
	canvas.arc(this.position.x, this.position.y, RADIUS, 0, 2 * Math.PI);
	canvas.fillStyle = util.format('rgba(0, 0, 0, %s)', options.visibility);
	canvas.fill();
	canvas.restore();
};

Bullet.prototype.getRectangle = function() {
	return new Rectangle(this.position, { width: 2 * RADIUS, height: 2 * RADIUS }, this.direction);
};

Bullet.prototype.toJSON = function() {
	return {
		position: { x: this.position.x, y: this.position.y },
		direction: this.direction
	};
};

module.exports = Bullet;
