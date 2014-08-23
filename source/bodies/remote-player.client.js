var util = require('util');

var Player = require('./Player');
var math = require('../math');

var UPDATES_SIZE = 60 * 2;

var NoopController = function() {};

NoopController.prototype.get = function(name) {
	return null;
};

NoopController.prototype.toJSON = function() {
	return {};
};

var RemotePlayer = function(game, options) {
	Player.call(this, game, new NoopController(), options);

	this.updates = [];
};

util.inherits(RemotePlayer, Player);

RemotePlayer.prototype.addUpdate = function(update) {
	this.updates.push(update);

	if(this.updates.length >= UPDATES_SIZE) {
		this.updates.shift();
	}
};

RemotePlayer.prototype.interpolate = function(time) {
	var updates = this._getUpdates(time);
	if(!updates) return;

	var next = updates.next;
	var previous = updates.previous;

	var diff = next.t - previous.t;
	var progress = diff ? (time - previous.t) / diff : 1;

	this.position = math.lerp(previous.position, next.position, progress);
	this.direction = (next.direction - previous.direction) * progress + next.direction;
};

RemotePlayer.prototype._getUpdates = function(time) {
	var updates = this.updates;

	for(var i = 0; i < updates.length - 1; i++) {
		if(updates[i].t < time && time < updates[i + 1].t) {
			return {
				next: updates[i],
				previous: updates[i + 1]
			};
		}
	}
};

module.exports = RemotePlayer;
