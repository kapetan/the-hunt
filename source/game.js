var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player');

var KeyboardController = require('./keyboard-controller');
var MouseController = require('./mouse-controller');

var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var CLEAR_RADIUS = 40;
var UPDATE_FREQUENCY = 16;
var UPDATES_SIZE = 60 * 2; // 60fps * 2s

var noop = function() {};

var InputController = function(element) {
	this.keyboard = new KeyboardController();
	this.mouse = new MouseController(element);
};

InputController.prototype.action = function(name) {
	return this.keyboard.action(name);
};

InputController.prototype.target = function() {
	return this.mouse.target();
};

InputController.prototype.active = function() {
	return this.keyboard.active() || this.mouse.active();
};

InputController.prototype.toJSON = function() {
	var json = this.keyboard.toJSON();
	json.target = this.mouse.toJSON().target;

	return json;
};

var NoopController = function() {};

NoopController.prototype.action = function() {
	return false;
};

NoopController.prototype.target = function() {
	return false;
};

NoopController.prototype.active = function() {
	return false;
};

NoopController.prototype.toJSON = function() {
	return {};
};

var Game = function(element) {
	element = document.getElementById(element);

	this.canvas = element.getContext('2d');
	this.size = { width: element.width, height: element.height };
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);

	this.bodies = [];
	this.others = [];
	this.ghosts = [];

	this.updates = [];
	this.inputs = [];

	this._animation = null;
	this._update = null;
	this._socket = null;

	this._add = [];
	this._remove = [];

	this.level = level(this);

	var input = new InputController(element);

	this.player = new Player(this, input, {
		position: this.getAvailablePosition({ width: CLEAR_RADIUS, height: CLEAR_RADIUS }, 0)
	});

	this.addBody(this.player);
	this.level.fog.reveal(this.player);

	level(this);
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
};

Game.prototype.draw = function() {
	this.canvas.clearRect(0, 0, this.size.width, this.size.height);

	var self = this;

	this.bodies.forEach(function(body) {
		if(body.active) {
			var visibility = body.visibility * self.player.visibilityOf(body);
			if(visibility > 0) body.draw({ visibility: visibility });
		} else {
			body.draw();
		}
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

Game.prototype.start = function() {
	var self = this;
	var socket = this._socket = io();

	socket.on('connect', function() {
		socket.emit('initialize', self.player.toJSON());
	});
	socket.on('initialize', function(message) {
		self._initialize(message);
	});
};

Game.prototype.stop = function() {
	cancelAnimationFrame(this._animation);
	clearInterval(this._update);
	this._socket.close();

	this._animation = null;
	this._update = null;
	this._socket = null;
};

Game.prototype.getAvailablePosition = function(size, direction) {
	var rectangle;

	do {
		var x = Math.random() * this.size.width;
		var y = Math.random() * this.size.height;

		rectangle = new Rectangle({ x: x, y: y }, size, direction);
	} while(this.getCollisions(rectangle).length || !this.inBounds(rectangle));

	return rectangle.position;
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

Game.prototype._initialize = function(options) {
	var self = this;
	var socket = this._socket;
	var lastTick = Date.now();
	var sequence = 0;

	this.player.id = options.id;
	this._addGhost(this.player);

	options.players.forEach(function(other) {
		self._addOther(other);
	});

	socket.on('update', function(updates) {
		self.updates.push(updates);

		if(self.updates.length >= UPDATES_SIZE) {
			self.updates.shift();
		}

		updates.forEach(function(player) {
			var ghost = find(self.ghosts, { id: player.id });

			if(ghost) {
				ghost.position = player.position;
				ghost.direction = player.direction;
			}
		});

		var local = find(updates, { id: self.player.id });
		var latestInput = find(self.inputs, { sequence: local.sequence });
		var latestIndex = self.inputs.indexOf(latestInput);

		if(latestIndex >= 0) {
			self.inputs.splice(0, latestIndex + 1);

			self.player.position = local.position;
			self.player.direction = local.direction;

			self.inputs.forEach(function(update) {
				self.player.processInput(update.input, update.dt);
			});
		}
	});
	socket.on('player_join', function(message) {
		self._addOther(message);
	});
	socket.on('player_leave', function(message) {
		var other = find(self.others, { id: message.id });
		var ghost = find(self.ghosts, { id: message.id });

		if(other) {
			self.removeBody(other);
			remove(self.others, other);
		}
		if(ghost) {
			self.removeBody(ghost);
			remove(self.ghosts, ghost);
		}
	});

	this._update = setInterval(function() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self.update(dt);

		if(self.player.isActive()) {
			var update = {
				input: self.player.controller.toJSON(),
				sequence: sequence++,
				dt: dt
			};

			self.inputs.push(update);
			socket.emit('update', update);
		}
	}, UPDATE_FREQUENCY);

	this._animation = requestAnimationFrame(function tick() {
		self.draw();
		self._animation = requestAnimationFrame(tick);
	});
};

Game.prototype._addOther = function(options) {
	var remote = new NoopController();
	var player = new Player(this, remote, options);

	this.addBody(player);
	this.others.push(player);
	this._addGhost(player);
};

Game.prototype._addGhost = function(player) {
	var options = player.toJSON();
	options.visibility = 0.5;
	options.collidable = false;
	options.footTrack = { update: noop };

	var ghost = new Player(this, new NoopController(), options);
	this.ghosts.push(ghost);
	this.addBody(ghost);
};

module.exports = Game;
