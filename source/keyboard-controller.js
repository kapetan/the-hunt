var ROTATION_SPEED = Math.PI / 800;

var values = function(obj) {
	return Object.keys(obj).map(function(key) {
		return obj[key];
	});
};

var Keyboard = function() {
	var keys = this.keys = {};

	this._onkeydown = function(e) {
		keys[e.keyCode] = true;
	};
	this._onkeyup = function(e) {
		keys[e.keyCode] = false;
	};
};

Keyboard.KEYS = { left: 37, up: 38, right: 39, down: 40, space: 32 };

Keyboard.prototype.attach = function() {
	window.addEventListener('keydown', this._onkeydown);
	window.addEventListener('keyup', this._onkeyup);
};

Keyboard.prototype.detach = function() {
	window.removeEventListener('keydown', this._onkeydown);
	window.removeEventListener('keyup', this._onkeyup);
};

Keyboard.prototype.pressed = function(key) {
	key = (typeof key === 'string') ? Keyboard.KEYS[key] : key;
	return !!this.keys[key];
};

Keyboard.prototype.some = function(keys) {
	var self = this;

	return keys.some(function(key) {
		return self.pressed(key);
	});
};

// Keyboard.prototype.every = function() {
// 	var self = this;

// 	return Array.prototype.slice.call(arguments).every(function(key) {
// 		return self.pressed(key);
// 	});
// };

var KeyboardController = function() {
	this._keyboard = new Keyboard();
	this._keyboard.attach();
};

KeyboardController.ACTIONS = { left: 'left', right: 'right', up: 'up', down: 'down', shoot: 'space' };
KeyboardController.ACTION_KEYS = values(KeyboardController.ACTIONS);
KeyboardController.ACTION_NAMES = Object.keys(KeyboardController.ACTIONS);

KeyboardController.prototype.action = function(name) {
	return this._keyboard.pressed(KeyboardController.ACTIONS[name]);
};

KeyboardController.prototype.target = function() {
	return null;
};

KeyboardController.prototype.active = function() {
	return this._keyboard.some(KeyboardController.ACTION_KEYS);
};

KeyboardController.prototype.toJSON = function() {
	var self = this;

	return KeyboardController.ACTION_NAMES.reduce(function(acc, key) {
		acc[key] = self.action(key);
		return acc;
	}, {});
};

module.exports = KeyboardController;
