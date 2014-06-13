var math = require('./math');

var Mouse = function(element) {
	this.position = null;
	this.pressed = false;

	var self = this;
	var local = {};

	element.addEventListener('mousemove', function(e) {
		local.x = e.offsetX;
		local.y = e.offsetY;

		self.position = local;
	});
	element.addEventListener('mouseleave', function() {
		self.position = null;
		self.pressed = false;
	});
	element.addEventListener('mousedown', function(e) {
		self.pressed = true;
	});
	element.addEventListener('mouseup', function(e) {
		self.pressed = false;
	});
};

var MouseController = function(element) {
	this._mouse = new Mouse(element);
};

MouseController.prototype.action = function(name) {
	return false;
};

MouseController.prototype.target = function() {
	return this._mouse.pressed ? this._mouse.position : null;
};

MouseController.prototype.active = function() {
	return !!this.target();
};

MouseController.prototype.toJSON = function() {
	return {
		target: this.target()
	};
};

module.exports = MouseController;
