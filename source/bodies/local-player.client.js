var util = require('util');

var Player = require('./player');
var find = require('../utils/find');

var SingleInputController = function(input) {
	this.input = input;
};

SingleInputController.prototype.get = function(name) {
	return this.input[name] || null;
};

SingleInputController.prototype.toJSON = function() {
	return this.input;
};

var LocalPlayer = function() {
	Player.apply(this, arguments);

	this.inputs = [];
	this.pending = null;
	this.sequence = 0;
};

util.inherits(LocalPlayer, Player);

LocalPlayer.prototype.update = function(dt) {
	Player.prototype.update.call(this, dt);

	var input = this.controller.toJSON();

	if(Object.keys(input).length) {
		var sequence = this.sequence++;
		var update = {
			input: input,
			sequence: sequence,
			dt: dt
		};

		this.inputs.push(update);
		this.pending = update;
	}
};

LocalPlayer.prototype.empty = function() {
	var pending = this.pending;
	this.pending = null;

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
		self.processInput(new SingleInputController(i.input), i.dt);
	});
};

module.exports = LocalPlayer;
