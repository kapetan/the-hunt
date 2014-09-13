var util = require('util');
var extend = require('xtend');

var Core = require('./game');
var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player.server');

var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var EMIT_POSITION_FREQUENCY = 45;
var CLEAR_RADIUS = 50;

var Game = function(size) {
	Core.call(this, size, level);

	this.players = [];
	this._update = null;
	this._state = null;
};

util.inherits(Game, Core);

Game.prototype.addPlayer = function(socket, options) {
	options = extend({
		id: socket.id,
		position: this._getPosition()
	}, options);

	var player = new Player(this, socket, options);

	this.players.push(player);
	this.addBody(player);

	return player;
};

Game.prototype.removePlayer = function(player) {
	this.removeBody(player);
	remove(this.players, player);
};

Game.prototype.addBullet = function(player, bullet) {
	var players = this._getPlayerState();
	var state = find(players, { id: player.id });

	state.bullet = bullet;
	this.emit('player_state', { players: players, t: Date.now() });
};

Game.prototype.start = function() {
	Core.prototype.start.call(this);

	var self = this;
	var lastTick = Date.now();

	this._update = setInterval(function() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self.update(dt);
	}, UPDATE_FREQUENCY);

	this._state = setTimeout(function emit() {
		var players = self._getPlayerState();

		self.emit('player_state', { players: players, t: Date.now() });
		self._state = setTimeout(emit, EMIT_POSITION_FREQUENCY);
	}, EMIT_POSITION_FREQUENCY);
};

Game.prototype.stop = function() {
	Core.prototype.stop.call(this);

	clearInterval(this._update);
	clearTimeout(this._state);

	this._update = null;
	this._state = null;
};

Game.prototype._getPosition = function() {
	var size = { width: CLEAR_RADIUS, height: CLEAR_RADIUS };
	var rectangle;

	do {
		var x = Math.random() * this.size.width;
		var y = Math.random() * this.size.height;

		rectangle = new Rectangle({ x: x, y: y }, size, 0);
	} while(this.isColliding(rectangle) || !this.inBounds(rectangle));

	return rectangle.position;
};

Game.prototype._getPlayerState = function() {
	return this.players.map(function(player) {
		return player.getState();
	});
};

module.exports = Game;
