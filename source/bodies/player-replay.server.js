var util = require('util');
var Player = require('./player');

var noop = function() {};

var PlayerReplay = function(game, options) {
	Player.call(this, game, options);
};

util.inherits(PlayerReplay, Player);

PlayerReplay.prototype.processInput = noop;
PlayerReplay.prototype.update = noop;

PlayerReplay.prototype.set = function(options) {
	this.position = options.position;
	this.direction = options.direction;
	this.ammunition = options.ammunition;
};

module.exports = PlayerReplay;
