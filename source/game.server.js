var events = require('events');
var util = require('util');

var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player');

var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var EMIT_POSITION_FREQUENCY = 45;

var ClientController = function(socket) {
	this.socket = socket;
	this.updates = [];
	this.latestSequence = -1;

	var self = this;

	socket.on('update', function(update) {
		self.updates.push(update);
	});
};

ClientController.prototype.get = function(name) {
	return (this.updates.length && this.updates[0].input[name]) || null;
};

ClientController.prototype.next = function() {
	if(this.updates.length) this.latestSequence = this.updates[0].sequence;
	return this.updates.shift();
};

ClientController.prototype.toJSON = function() {
	return this.updates.length ? this.updates[0].input : {};
};

var Game = function(size) {
	events.EventEmitter.call(this);

	this.size = size;
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);
	this.bodies = [];
	this.players = [];

	this._update = null;
	this._state = null;

	this._add = [];
	this._remove = [];

	this.level = level(this);
};

util.inherits(Game, events.EventEmitter);

Game.prototype.update = function(dt) {
	append(this.bodies, this._add);
	remove(this.bodies, this._remove);

	this._add = [];
	this._remove = [];

	this.bodies.forEach(function(body) {
		body.update(dt);
	});

	this.players.forEach(function(player) {
		player.controller.next();
	});
};

Game.prototype.addBody = function(body) {
	if(this._update) this._add.push(body);
	else this.bodies.push(body);
};

Game.prototype.removeBody = function(body) {
	if(this._update) this._remove.push(body);
	else remove(this.bodies, body);
};

Game.prototype.addPlayer = function(socket, options) {
	var self = this;
	var controller = new ClientController(socket);
	var player = new Player(this, controller, options);

	player.on('bullet', function(bullet) {
		var players = self._getPlayerState();
		var state = find(players, { id: player.id });

		state.bullet = bullet.toJSON();

		self.emit('player_position', { players: players, t: Date.now() });
	});

	this.players.push(player);
	this.addBody(player);
};

Game.prototype.removePlayer = function(player) {
	this.removeBody(player);
	remove(this.players, player);
};

Game.prototype.start = function() {
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

		self.emit('player_position', { players: players, t: Date.now() });
		self._state = setTimeout(emit, EMIT_POSITION_FREQUENCY);
	}, EMIT_POSITION_FREQUENCY);
};

Game.prototype.stop = function() {
	clearInterval(this._update);
	clearTimeout(this._state);

	this._update = null;
	this._state = null;
};

Game.prototype.getCollisions = function(rectangle, ignore) {
	return this.bodies.filter(function(body) {
		if(ignore && ignore.indexOf(body) >= 0) return false;
		return body.collidable && rectangle.isColliding(body.getRectangle());
	});
};

Game.prototype.inBounds = function(rectangle) {
	return this.bounds.isRectangleInside(rectangle);
};

Game.prototype._getPlayerState = function() {
	return this.players.map(function(player) {
		return {
			id: player.id,
			sequence: player.controller.latestSequence,
			position: player.position,
			direction: player.direction
		};
	});
};

module.exports = Game;
