var Mouse = function(element) {
	var local = {};
	var input = this.input = {};

	element.addEventListener('mousemove', function(e) {
		local.x = e.offsetX;
		local.y = e.offsetY;
	});
	element.addEventListener('mouseleave', function(e) {
		delete input.target;
	});
	element.addEventListener('mousedown', function(e) {
		input.target = local;
	});
	element.addEventListener('mouseup', function(e) {
		delete input.target;
	});
};

module.exports = Mouse;
