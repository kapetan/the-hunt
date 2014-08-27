var extend = require('xtend');

var Rectangle = require('./bodies/rectangle');
var LocalPlayer = require('./bodies/local-player.client');
var RemotePlayer = require('./bodies/remote-player.client');
var Keyboard = require('./keyboard');
var Mouse = require('./mouse');

var append = require('./utils/append');
var remove = require('./utils/remove');
var find = require('./utils/find');
var filter = require('./utils/filter');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var UPDATE_OFFSET = 100;
var INITIAL_POSITION = { x: 30, y: 30 };

var InputController = function(element) {
	this.keyboard = new Keyboard();
	this.mouse = new Mouse(element);
};

InputController.prototype.__defineGetter__('input', function() {
	return extend(this.keyboard.input, this.mouse.input);
});

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
	this._emit = null;
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

	if(this._options.offline) {
		this._initializeLocal({
			self: { position: INITIAL_POSITION },
			others: [],
			t: Date.now()
		});
	} else {
		this._socket = io();
		this._socket.on('initialize', function(message) {
			self._initializeLocal(message);
			self._initializeRemote();
		});
	}
};

Game.prototype.stop = function() {
	cancelAnimationFrame(this._animation);
	clearInterval(this._update);
	clearInterval(this._emit);
	this._socket.close();

	this._animation = null;
	this._update = null;
	this._emit = null;
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

Game.prototype._initializeLocal = function(options) {
	var self = this;
	var lastTick = Date.now();

	this._time = { u: Date.now(), v: options.t };

	this._createPlayer(options.self);

	options.others.forEach(function(other) {
		self._addOther(other);
	});

	this._update = setInterval(function() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self._time.v += (now - self._time.u);
		self._time.u = now;

		self.update(dt);
	}, UPDATE_FREQUENCY);

	this._animation = requestAnimationFrame(function tick() {
		self.draw();
		self._animation = requestAnimationFrame(tick);
	});
};

Game.prototype._initializeRemote = function() {
	var self = this;
	var socket = this._socket;

	socket.on('player_state', function(message) {
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

	this._emit = setInterval(function() {
		self.player.drain().forEach(function(update) {
			socket.emit('update', update);
		});
	}, UPDATE_FREQUENCY);
};

Game.prototype._createPlayer = function(options) {
	var controller = new InputController(this.element);
	this.player = new LocalPlayer(this, controller, options);

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
