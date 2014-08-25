var path = require('path');

var root = require('root');
var send = require('send');
var socketio = require('socket.io');

var Game = require('./source/game.server');

var PORT = process.env.PORT || 10103;

var app = root();
var io = socketio(app);
var game = new Game({ width: 512, height: 512 });

app.get('{*}', function(request, response) {
	send(request, request.params.glob)
		.root(path.join(__dirname, 'dist'))
		.pipe(response);
});

io.on('connection', function(socket) {
	var others = game.players.slice();
	var player = game.addPlayer(socket);

	socket.emit('initialize', {
		self: player,
		others: others,
		t: Date.now()
	});

	socket.broadcast.emit('player_join', player);

	socket.on('disconnect', function() {
		game.removePlayer(player);
		socket.broadcast.emit('player_leave', { id: player.id });
	});
});

game.on('player_position', function(data) {
	io.emit('player_position', data);
});

game.start();

app.listen(PORT, function() {
	console.log('Server listening on port ' + PORT);
});
