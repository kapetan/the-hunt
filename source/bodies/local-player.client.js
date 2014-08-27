var util = require('util');
var Player = require('./player');
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
		var update = {
			input: input,
			sequence: sequence,
			dt: dt
		};

		this.inputs.push(update);
		this.pending.push(update);
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
