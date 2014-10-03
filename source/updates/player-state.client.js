var stream = require('stream');
var util = require('util');

var PlayerStream = function() {
	stream.Readable.call(this, { objectMode: true, highWaterMark: 16 });
};

util.inherits(PlayerStream, stream.Readable);

PlayerStreams.prototype._read = function() {};

var SocketStream = function() {
	stream.Readable.call(this, { objectMode: true, highWaterMark: 16 });

	this._socket = socket;
	this._players = {};

	var self = this;

	socket.on('close', function() {
		self.emit('close');
	});
	socket.on('error', function(err) {
		self.emit('error', err);
	});
	socket.on('player_state', function(update) {
		update.players.forEach(function(state) {
			var stream = self._players[state.id];

			if(stream) {
				state.t = update.t;
				stream.push(state);
			}
		});
	});
};

util.inherits(SocketStream, stream.Readable);

SocketStream.prototype._read = function() {};

SocketStream.prototype.destroy = function() {
	this._socket.close();
};

SocketStream.prototype.createPlayerStream = function(id) {
	var stream = new PlayerStream();
	this._players[id] = stream;

	return stream;
};
