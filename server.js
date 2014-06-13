var path = require('path');

var root = require('root');
var send = require('send');
var chokidar = require('chokidar');
var socketio = require('socket.io');

var build = require('./build');

var PORT = 10103;

var app = root();

var watch = function() {
	chokidar.watch(path.join(__dirname, 'source')).on('change', function() {
		build(function(err) {
			if(err) console.error(err.stack);
		});
	});
};

app.get('/', function(request, response) {
	response.redirect('/dist/index.html');
});

app.get('{*}', function(request, response) {
	send(request, request.params.glob)
		.root(__dirname)
		.pipe(response);
});

build(function() {
	watch();
});

app.on('bind', function(address, server) {
	var io = socketio(server);

	io.on('connection', function(socket) {
		socket.emit('initialize', { id: socket.id });

		socket.on('initialize', function(message) {
			message.id = socket.id;
			socket.broadcast.emit('player_join', message);
		});

		socket.on('update', function(message) {
			message.id = socket.id;
			socket.broadcast.emit('player_update', message);
		});

		socket.on('disconnect', function() {
			socket.broadcast.emit('player_leave', { id: socket.id });
		});
	});
});

app.listen(PORT, function() {
	console.log('Server listening on port ' + PORT);
});
