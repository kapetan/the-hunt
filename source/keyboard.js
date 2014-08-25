var KEYS = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	32: 'space'
};

var ACTIONS = {
	left: 'left',
	up: 'up',
	right: 'right',
	down: 'down',
	space: 'shoot'
};

var action = function(key) {
	return ACTIONS[KEYS[key]];
};

var Keyboard = function() {
	var input = this.input = {};

	this._onkeydown = function(e) {
		var a = action(e.keyCode);
		if(a) input[a] = true;
	};
	this._onkeyup = function(e) {
		delete input[action(e.keyCode)];
	};

	window.addEventListener('keydown', this._onkeydown);
	window.addEventListener('keyup', this._onkeyup);
};

module.exports = Keyboard;
