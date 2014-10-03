var stream = require('stream');
var util = require('util');

var BufferStream = function(size) {
	stream.Writable.call(this, { objectMode: true, highWaterMark: 16 });

	this._size = size;
	this._buffer = [];
};

BufferStream.prototype._write = function(data, encoding, callback) {
	this._buffer.push(data);

	if(this._buffer.length === this._size) {
		this._buffer.shift();
	}
};

BufferStream.prototype.drain = function() {
	var buffer = this._buffer;
	this._buffer = [];

	return buffer;
};
