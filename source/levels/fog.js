var util = require('util');

var DENSITY = 0.1;
var EDGE_WIDTH = 20;

var fog = function() {
	return util.format('rgba(0, 0, 0, %s)', DENSITY);
};

var Fog = function(game) {
	this.game = game;
	this.revealed = [];

	this.active = false;
	this.collidable = false;
};

Fog.prototype.update = function(dt) {};

Fog.prototype.draw = function() {
	var canvas = this.game.canvas;
	var size = this.game.size;

	canvas.save();

	canvas.beginPath();
	canvas.moveTo(0, 0);
	canvas.lineTo(size.width, 0);
	canvas.lineTo(size.width, size.height);
	canvas.lineTo(0, size.height);
	canvas.lineTo(0, 0);

	this.revealed.forEach(function(body) {
		var position = body.position;
		var lineOfSight = body.lineOfSight;

		canvas.arc(position.x, position.y, lineOfSight, 0, 2 * Math.PI, true);

		canvas.fillStyle = fog();
		canvas.fill();

		var edge = canvas.createRadialGradient(position.x, position.y, lineOfSight - EDGE_WIDTH, position.x, position.y, lineOfSight);
		edge.addColorStop(0, 'rgba(255, 255, 255, 0)');
		edge.addColorStop(1, fog());

		canvas.arc(position.x, position.y, lineOfSight, 0, 2 * Math.PI);
		canvas.fillStyle = edge;
		canvas.fill();
	});

	canvas.restore();
};

Fog.prototype.reveal = function(body) {
	this.revealed.push(body);
};

module.exports = Fog;
