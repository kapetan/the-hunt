var util = require('util');

var Player = require('./player');
var Bullet = require('./bullet');

var copy = require('../utils/copy');
var find = require('../utils/find');

var LocalPlayer = function(game, controller, options) {
	Player.call(this, game, options);

	this.inputs = [];
	this.pending = [];
	this.sequence = 0;

	this.controller = controller;
};

util.inherits(LocalPlayer, Player);

LocalPlayer.prototype.update = function(dt) {
	Player.prototype.update.call(this, dt);

	var input = this.controller.input;

	if(Object.keys(input).length) {
		this.processInput(input, dt);

		var sequence = this.sequence++;

		this.inputs.push({
			input: input,
			sequence: sequence,
			dt: dt
		});
		this.pending.push({
			input: input,
			sequence: sequence
		});

		if(this.hasShot()) {
			var hit = this.game.hitscan(this.position, this.direction, this);
			var bullet = new Bullet(this.game, this, hit.position);

			this.pending[this.pending.length - 1].bullet = copy({
				hit: hit,
				shoot: {
					position: this.position,
					direction: this.direction
				}
			});

			this.game.addBullet(bullet);
		}
	}
};

LocalPlayer.prototype.drain = function() {
	var pending = this.pending;
	this.pending = [];

	return pending;
};

LocalPlayer.prototype.reconcile = function(update) {
	var self = this;
	var latest = find(this.inputs, { sequence: update.sequence });
	var index = this.inputs.indexOf(latest);

	this.inputs.splice(0, index + 1);

	this.position = update.position;
	this.direction = update.direction;

	this.inputs.forEach(function(i) {
		self.processInput(i.input, i.dt);
	});
};

module.exports = LocalPlayer;
