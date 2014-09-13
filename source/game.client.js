var util = require('util');
var extend = require('xtend');

var Core = require('./game');
var LocalPlayer = require('./bodies/local-player.client');
var RemotePlayer = require('./bodies/remote-player.client');
var Keyboard = require('./keyboard');
var Mouse = require('./mouse');

var remove = require('./utils/remove');
var find = require('./utils/find');

var level = require('./levels/level-1');

var UPDATE_FREQUENCY = 16;
var UPDATE_OFFSET = 100;
var EMIT_UPDATES_FREQUENCY = 45;
var INITIAL_POSITION = { x: 30, y: 30 };

var TIME_SYNC_RETRIES = 2;
var TIME_SYNC_FREQUENCY = 100;

var InputController = function(element) {
	this.keyboard = new Keyboard();
	this.mouse = new Mouse(element);
};

InputController.prototype.__defineGetter__('input', function() {
	return extend(this.keyboard.input, this.mouse.input);
});

var Game = function(element, options) {
	element = document.getElementById(element);

	Core.call(this, { width: element.width, height: element.height }, level);

	this._options = options || {};
	this.element = element;
	this.canvas = element.getContext('2d');

	this.player = null;
	this.others = [];

	this._animation = null;
	this._update = null;
	this._emit = null;
	this._socket = null;
	this._time = { u: 0, v: 0 };
};

util.inherits(Game, Core);

Game.prototype.update = function(dt) {
	Core.prototype.update.call(this, dt);

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

Game.prototype.addBullet = function(bullet) {
	this.addBody(bullet);
	this._addBulletRemote();
};

Game.prototype.start = function() {
	Core.prototype.start.call(this);

	var self = this;

	if(this._options.offline) {
		this._initializeLocal({
			self: { position: INITIAL_POSITION },
			others: [],
			t: Date.now()
		});
		this._drainUpdates();
	} else {
		this._socket = io({
			reconnection: false
		});
		this._socket.on('initialize', function(message) {
			self._synchronizeTime(function(t) {
				message.t = t;

				self._initializeLocal(message);
				self._initializeRemote();
			});
		});
	}
};

Game.prototype.stop = function() {
	Core.prototype.stop.call(this);

	cancelAnimationFrame(this._animation);
	clearInterval(this._update);
	clearInterval(this._emit);
	this._socket.close();

	this._animation = null;
	this._update = null;
	this._emit = null;
	this._socket = null;
};

Game.prototype.hitscan = function(source) {
	var hit = Core.prototype.hitscan.call(this, source);
	hit.t = this._time.v;

	return hit;
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
		var updates = self.player.drain();
		if(updates.length) socket.emit('update', updates);
	}, EMIT_UPDATES_FREQUENCY);
};

Game.prototype._addBulletRemote = function() {
	if(this._socket) this._socket.emit('update', this.player.drain());
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

Game.prototype._drainUpdates = function() {
	var self = this;

	setInterval(function() {
		self.player.drain();
	}, UPDATE_FREQUENCY);
};

Game.prototype._synchronizeTime = function(callback) {
	var socket = this._socket;
	var times = TIME_SYNC_RETRIES;
	var l = Number.MAX_VALUE;
	var t = 0;

	var sync = function() {
		var now = Date.now();

		socket.once('pong', function(message) {
			var latency = (Date.now() - now) / 2;

			if(latency < l) {
				t = message.t;
				l = latency;
			}

			if(times--) setTimeout(sync, TIME_SYNC_FREQUENCY);
			else callback(Math.round(t - l));
		});

		socket.emit('ping');
	};

	sync();
};

module.exports = Game;
