var util = require('util');
var Player = require('./Player');

var ServerPlayer = function(game, socket, options) {
	Player.call(this, game, options);

	var self = this;

	this.updates = [];
	this.sequence = -1;

	socket.on('update', function(update) {
		self.updates.push(update);
	});
};

util.inherits(ServerPlayer, Player);

ServerPlayer.prototype.update = function(dt) {
	Player.prototype.update.call(this, dt);

	var update = this.updates.shift();

	if(update) {
		this.processInput(update.input, dt);
		this.sequence = update.sequence;
	}
};

ServerPlayer.prototype.getState = function() {
	return {
		id: this.id,
		sequence: this.sequence,
		position: this.position,
		direction: this.direction
	};
};

module.exports = ServerPlayer;
