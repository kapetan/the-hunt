var Rectangle = require('./bodies/rectangle');
var LocalPlayer = require('./bodies/local-player.client');
var RemotePlayer = require('./bodies/remote-player.client');

var KeyboardController = require('./keyboard-controller');
var MouseController = require('./mouse-controller');

var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');
var filter = require('./utils/filter');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var UPDATE_OFFSET = 100;

var InputController = function(element) {
	this.keyboard = new KeyboardController();
	this.mouse = new MouseController(element);
};

InputController.prototype.get = function(name) {
	return this.keyboard.get(name) || this.mouse.get(name);
};

InputController.prototype.toJSON = function() {
	var json = this.keyboard.toJSON();
	json.target = this.mouse.get('target');

	return filter(json, function(key, value) {
		return value;
	});
};

var Game = function(element, options) {
	this._options = options || {};
	element = document.getElementById(element);

	this.element = element;
	this.canvas = element.getContext('2d');
	this.size = { width: element.width, height: element.height };
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);

	this.player = null;
	this.bodies = [];
	this.others = [];

	this._animation = null;
	this._update = null;
	this._socket = null;
	this._time = { u: 0, v: 0 };

	this._add = [];
	this._remove = [];

	this.level = level(this);

	level(this);
};

Game.prototype.update = function(dt) {
	append(this.bodies, this._add);
	remove(this.bodies, this._remove);

	this._add = [];
	this._remove = [];

	this.bodies.forEach(function(body) {
		body.update(dt);
	});

	var time = this._time.v - UPDATE_OFFSET;

	this.others.forEach(function(other) {
		other.interpolate(time);
	});
};

Game.prototype.draw = function() {
	this.canvas.clearRect(0, 0, this.size.width, this.size.height);

	var self = this;

	this.bodies.forEach(function(body) {
		if(body.active && !self._options.debug) {
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

	this._time = { u: Date.now(), v: options.t };

	this._createPlayer(options.self);

	options.others.forEach(function(other) {
		self._addOther(other);
	});

	socket.on('player_position', function(message) {
		var update = find(message.players, { id: self.player.id });
		if(update) self.player.reconcile(update);

		self.others.forEach(function(other) {
			var update = find(message.players, { id: other.id });

			if(update) {
				update.t = message.t;
				other.addUpdate(update);
			}
		});
	});
	socket.on('player_join', function(message) {
		self._addOther(message);
	});
	socket.on('player_leave', function(message) {
		var other = find(self.others, { id: message.id });

		if(other) {
			self.removeBody(other);
			remove(self.others, other);
		}
	});

	this._update = setInterval(function() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self._time.v += (now - self._time.u);
		self._time.u = now;

		self.update(dt);

		var update = self.player.empty();

		if(update) {
			socket.emit('update', update);
		}
	}, UPDATE_FREQUENCY);

	this._animation = requestAnimationFrame(function tick() {
		self.draw();
		self._animation = requestAnimationFrame(tick);
	});
};

Game.prototype._createPlayer = function(options) {
	var input = new InputController(this.element);

	this.player = new LocalPlayer(this, input, options);

	this.addBody(this.player);
	this.level.fog.reveal(this.player);
};

Game.prototype._addOther = function(options) {
	options.active = true;

	var player = new RemotePlayer(this, options);

	this.addBody(player);
	this.others.push(player);
};

module.exports = Game;
