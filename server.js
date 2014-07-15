var path = require('path');

var root = require('root');
var send = require('send');
var socketio = require('socket.io');

var Game = require('./source/game.server');
var find = require('./source/utils/find');

var PORT = process.env.PORT || 10103;
var UPDATE_FREQUENCY = 45;

var app = root();
var game = new Game({ width: 512, height: 512 });

game.start();

app.get('/', function(request, response) {
	response.redirect('/dist/index.html');
});

app.get('{*}', function(request, response) {
	send(request, request.params.glob)
		.root(__dirname)
		.pipe(response);
});

app.on('bind', function(address, server) {
	var io = socketio(server);

	io.on('connection', function(socket) {
		socket.on('initialize', function(message) {
			var players = game.players.map(function(player) {
				return player.toJSON();
			});

			message.id = socket.id;
			game.addPlayer(socket, message);

			socket.emit('initialize', { id: socket.id, players: players });
			socket.broadcast.emit('player_join', message);
		});

		socket.on('disconnect', function() {
			var player = find(game.players, { id: socket.id });

			if(player) {
				game.removePlayer(player);
				socket.broadcast.emit('player_leave', { id: socket.id });
			}
		});
	});

	setTimeout(function update() {
		var players = game.players.map(function(player) {
			return {
				id: player.id,
				sequence: player.controller.latestSequence,
				position: player.position,
				direction: player.direction
			};
		});

		io.emit('update', { players: players, t: Date.now() });

		setTimeout(update, UPDATE_FREQUENCY);
	}, UPDATE_FREQUENCY);
});

app.listen(PORT, function() {
	console.log('Server listening on port ' + PORT);
});
