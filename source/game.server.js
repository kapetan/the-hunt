var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player');

var append = require('./utils/append');
var remove = require('./utils/remove');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;

var ClientController = function(socket) {
	this.socket = socket;
	this.updates = [];
	this.latestSequence = -1;

	var self = this;

	socket.on('update', function(update) {
		self.updates.push(update);
	});
};

ClientController.prototype.action = function(name) {
	return this.updates.length ? this.updates[0].input[name] : false;
};

ClientController.prototype.target = function() {
	return this.updates.length ? this.updates[0].input.target : null;
};

ClientController.prototype.active = function() {
	return !!this.updates.length;
};

ClientController.prototype.next = function() {
	if(this.updates.length) this.latestSequence = this.updates[0].sequence;
	return this.updates.shift();
};

ClientController.prototype.toJSON = function() {
	return this.updates.length ? this.updates[0].input : {};
};

var Game = function(size) {
	this.size = size;
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);
	this.bodies = [];
	this.players = [];

	this._update = null;

	this._add = [];
	this._remove = [];

	this.level = level(this);
};

Game.prototype.update = function(dt) {
	var self = this;

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
	var controller = new ClientController(socket);
	var player = new Player(this, controller, options);

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
};

Game.prototype.stop = function() {
	clearInterval(this._update);
	this._update = null;
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

module.exports = Game;
