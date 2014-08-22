var path = require('path');

var root = require('root');
var send = require('send');
var socketio = require('socket.io');

var Game = require('./source/game.server');
var find = require('./source/utils/find');

var PORT = process.env.PORT || 10103;

var app = root();
var io = socketio(app);
var game = new Game({ width: 512, height: 512 });

app.get('/', function(request, response) {
	response.redirect('/dist/index.html');
});

app.get('{*}', function(request, response) {
	send(request, request.params.glob)
		.root(__dirname)
		.pipe(response);
});

io.on('connection', function(socket) {
	socket.on('initialize', function(message) {
		var players = game.players.map(function(player) {
			return player.toJSON();
		});

		message.id = socket.id;
		game.addPlayer(socket, message);

		socket.emit('initialize', { id: socket.id, players: players, t: Date.now() });
		socket.broadcast.emit('player_join', message);
	});

	socket.on('disconnect', function() {
		var player = find(game.players, { id: socket.id });

		if(player) {
			game.removePlayer(player);
			socket.broadcast.emit('player_leave', { id: socket.id, t: Date.now() });
		}
	});
});

game.on('player_position', function(data) {
	io.emit('player_position', data);
});

game.start();

app.listen(PORT, function() {
	console.log('Server listening on port ' + PORT);
});
