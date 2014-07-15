var path = require('path');
var chokidar = require('chokidar');

var build = require('./build');

var error = function(err) {
	if(err) console.error(err.stack);
};

var watch = function() {
	chokidar.watch(path.join(__dirname, 'source'), { persistent: true }).on('change', function() {
		build(error);
	});
};

module.exports = function() {
	build(function(err) {
		error(err);
		watch();
	});
};

if(require.main === module) {
	module.exports();
}
