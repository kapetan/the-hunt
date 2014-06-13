var Rectangle = require('./bodies/rectangle');
var Player = require('./bodies/player');
//var GhostOpponent = require('./bodies/ghost-opponent');

var KeyboardController = require('./keyboard-controller');
var MouseController = require('./mouse-controller');

var level = require('./levels/level-1');

var CLEAR_RADIUS = 40;

var append = function(target, source) {
	source.forEach(function(item) {
		target.push(item);
	});
};

var remove = function(target, source) {
	source.forEach(function(item) {
		var i = target.indexOf(item);
		if(i >= 0) target.splice(i, 1);
	});
};

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

var RemoteController = function(socket) {
	this.socket = socket;
	this.update = null;

	var self = this;

	socket.on('player_update', function(message) {
		self.update = message;
	});
};

RemoteController.prototype.action = function(name) {
	return this.update ? this.update.inputs[name] : false;
};

RemoteController.prototype.target = function() {
	return this.update && this.update.inputs.target;
};

// var Mouse = function(element) {
// 	this.position = null;
// 	this.pressed = false;

// 	var self = this;
// 	var local = {};

// 	element.addEventListener('mousemove', function(e) {
// 		local.x = e.offsetX;
// 		local.y = e.offsetY;

// 		self.position = local;
// 	});
// 	element.addEventListener('mouseleave', function() {
// 		self.position = null;
// 		self.pressed = false;
// 	});
// 	element.addEventListener('mousedown', function(e) {
// 		self.pressed = true;
// 	});
// 	element.addEventListener('mouseup', function(e) {
// 		self.pressed = false;
// 	});
// };

// var Keyboard = function(element) {
// 	this.keys = {};

// 	var self = this;

// 	window.addEventListener('keydown', function(e) {
// 		self.keys[e.keyCode] = true;
// 	});
// 	window.addEventListener('keyup', function(e) {
// 		self.keys[e.keyCode] = false;
// 	});
// };

// Keyboard.KEYS = { left: 37, up: 38, right: 39, down: 40, space: 32 };

// Keyboard.prototype.pressed = function(key) {
// 	key = (typeof key === 'string') ? Keyboard.KEYS[key] : key;
// 	return !!this.keys[key];
// };

// Keyboard.prototype.some = function() {
// 	var self = this;

// 	return Array.prototype.slice.call(arguments).some(function(key) {
// 		return self.pressed(key);
// 	});
// };

// Keyboard.prototype.every = function() {
// 	var self = this;

// 	return Array.prototype.slice.call(arguments).every(function(key) {
// 		return self.pressed(key);
// 	});
// };

var Game = function(element) {
	element = document.getElementById(element);

	this.canvas = element.getContext('2d');
	this.size = { width: element.width, height: element.height };
	this.bounds = Rectangle.aligned({ x: 0, y: 0 }, this.size, 0);
	this.bodies = [];
	this.others = [];

	this._animation = null;
	this._socket = null;
	//this.mouse = new Mouse(element);
	//this.keyboard = new Keyboard(element);

	//var keyboard = new KeyboardController();

	this._add = [];
	this._remove = [];

	this.level = level(this);

	var input = new InputController(element);

	this.player = new Player(this, input, {
		position: this.getAvailablePosition({ width: CLEAR_RADIUS, height: CLEAR_RADIUS }, 0)
	});

	this.addBody(this.player);
	this.level.fog.reveal(this.player);

	//level(this);
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
	if(this._animation) this._add.push(body);
	else this.bodies.push(body);
};

Game.prototype.removeBody = function(body) {
	if(this._animation) this._remove.push(body);
	else remove(this.bodies, [body]);
};

Game.prototype.start = function() {
	var self = this;
	var socket = this._socket = io();
	var lastTick = Date.now();

	socket.on('connect', function() {
		socket.emit('initialize', self.player.toJSON());
	});
	socket.on('initialize', function(message) {
		self.player.id = message.id;
	});
	socket.on('player_join', function(message) {
		var remote = new RemoteController(socket);
		var player = new Player(self, remote, message);

		self.addBody(player);
		self.others.push(player);
	});
	socket.on('player_leave', function(message) {
		for(var i = 0; i < self.others.length; i++) {
			var other = self.others[i];

			if(other.id === message.id) {
				self.removeBody(other);
				self.others.splice(i, 1);

				return;
			}
		}
	});

	this._animation = requestAnimationFrame(function tick() {
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;

		self.update(dt);
		self.draw();

		if(self.player.isActive()) {
			socket.emit('update', self.player.getInputs());
		}

		self._animation = requestAnimationFrame(tick);
	});
};

Game.prototype.stop = function() {
	cancelAnimationFrame(this._animation);
	this._socket.close();

	this._animation = null;
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

module.exports = Game;
