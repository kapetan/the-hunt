var events = require('events');
var util = require('util');
var extend = require('xtend');

var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player.server');

var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var EMIT_POSITION_FREQUENCY = 45;
var CLEAR_RADIUS = 50;

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
	options = extend({
		id: socket.id,
		position: this._getPosition()
	}, options);

	var self = this;
	var player = new Player(this, socket, options);

	this.players.push(player);
	this.addBody(player);

	return player;
};

Game.prototype.removePlayer = function(player) {
	this.removeBody(player);
	remove(this.players, player);
};

Game.prototype.addBullet = function(bullet) {
	var players = this._getPlayerState();
	var state = find(players, { id: bullet.player.id });

	state.bullet = bullet.toJSON();

	this.addBody(bullet);
	this.emit('player_state', { players: players, t: Date.now() });
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

		self.emit('player_state', { players: players, t: Date.now() });
		self._state = setTimeout(emit, EMIT_POSITION_FREQUENCY);
	}, EMIT_POSITION_FREQUENCY);
};

Game.prototype.stop = function() {
	clearInterval(this._update);
	clearTimeout(this._state);

	this._update = null;
	this._state = null;
};

Game.prototype.isColliding = function(rectangle, ignore) {
	return this.bodies.some(function(body) {
		if(ignore && ignore.indexOf(body) >= 0) return false;
		return body.collidable && rectangle.isColliding(body.getRectangle());
	});
};

Game.prototype.inBounds = function(rectangle) {
	return this.bounds.isRectangleInside(rectangle);
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
