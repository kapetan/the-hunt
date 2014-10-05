var util = require('util');
var validator = require('is-my-json-valid');

var Player = require('./player');
var append = require('../utils/append');
var updateJSON = require('../json/update');

var isUpdateValid = validator(updateJSON);

var ServerPlayer = function(game, socket, options) {
	Player.call(this, game, options);

	var self = this;

	this.updates = [];
	this.sequence = -1;

	socket.on('update', function(updates) {
		if(!isUpdateValid(updates)) return socket.disconnect();
		append(self.updates, updates);
	});
};

util.inherits(ServerPlayer, Player);

ServerPlayer.prototype.update = function(dt) {
	Player.prototype.update.call(this, dt);

	var update = this.updates.shift();

	if(update) {
		if(!update.bullet) {
			delete update.input.shoot;
		}

		this.processInput(update.input, dt);
		this.sequence = update.sequence;

		if(update.bullet) this.game.addBullet(this, update.bullet);
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
