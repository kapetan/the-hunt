var map = require('./utils/map');

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

var KeyboardController = function() {
	this._keyboard = new Keyboard();
	this._keyboard.attach();
};

KeyboardController.ACTIONS = { left: 'left', right: 'right', up: 'up', down: 'down', shoot: 'space' };

KeyboardController.prototype.get = function(name) {
	return this._keyboard.pressed(KeyboardController.ACTIONS[name]) || null;
};

KeyboardController.prototype.toJSON = function() {
	var self = this;

	return map(KeyboardController.ACTIONS, function(key) {
		return self.get(key);
	});
};

module.exports = KeyboardController;
