var util = require('util');
var events = require('events');
var extend = require('xtend');

var math = require('../math');
var Rectangle = require('./rectangle');

var COLOR = [0, 0, 0];

var rgba = function(color, alpha) {
	return util.format('rgba(%s, %s, %s, %s)', color[0], color[1], color[2], alpha);
};

var Base = function(game, options) {
	events.EventEmitter.call(this);

	options = options || {};

	this.game = game;

	this.position = options.position || { x: 0, y: 0 };
	this.size = options.size || { width: 0, height: 0 };
	this.direction = options.direction || 0;
	this.visibility = (options.visibility === undefined) ? 1 : options.visibility;
	this.color = options.color || COLOR;
};

util.inherits(Base, events.EventEmitter);

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
