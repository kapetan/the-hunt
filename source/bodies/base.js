var util = require('util');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');

var rgba = function(color, alpha) {
	return util.format('rgba(%s, %s, %s, %s)', color[0], color[1], color[2], alpha);
};

var Base = function(game, options) {
	this.game = game;

	options = extend({
		position: { x: 0, y: 0 },
		size: { width: 0, height: 0 },
		direction: 0,
		visibility: 1,
		color: [0, 0, 0]
	}, options);

	this.position = { x: options.position.x, y: options.position.y };
	this.size = { width: options.size.width, height: options.size.height };
	this.direction = options.direction;
	this.visibility = options.visibility;
	this.color = options.color;
};

Base.prototype.getRectangle = function() {
	return new Rectangle(this.position, this.size, this.direction);
};

Base.prototype.update = function(dt) {};

Base.prototype.draw = function(options) {
	var canvas = this.game.canvas;

	options = extend(this, options);
	if(options.visibility - Math.pow(10, -10) <= 0) return;
	if(options.size.width <= 0 || options.size.height <= 0) return;

	canvas.save();
	canvas.translate(options.position.x, options.position.y);
	canvas.rotate(options.direction);
	canvas.fillStyle = rgba(options.color, options.visibility);
	canvas.fillRect(-options.size.width / 2, -options.size.height / 2, options.size.width, options.size.height);
	canvas.restore();
};

Base.prototype.distanceTo = function(bodyOrPoint) {
	var point = bodyOrPoint.position ? bodyOrPoint.position : bodyOrPoint;
	return math.distance(point, this.position);
};

module.exports = Base;
