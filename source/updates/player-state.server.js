var stream = require('stream');
var util = require('util');

var SocketStream = function(socket) {
	stream.Readable.call(this, { objectMode: true, highWaterMark: 16 });
	this._socket = socket;

	var self = this;

	socket.on('close', function() {
		self.emit('close');
	});
	socket.on('error', function(err) {
		self.emit('error', err);
	});
	socket.on('update', function(updates) {
		updates.forEach(function(u) {
			self.push(u);
		});
	});
};

util.inherits(SocketStream, stream.Readable);

SocketStream.prototype._read = function() {};

SocketStream.prototype.destroy = function() {
	this._socket.close();
};
