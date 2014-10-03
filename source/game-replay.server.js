var util = require('util');

var Core = require('./game');
var Player = require('./bodies/player-replay.server');
var find = require('./utils/find');
var remove = require('./utils/remove');

// About two minutes of data
// (assuming an update frequency of every 16 ms)
var UPDATE_SIZE = 7500;
var TIME_SLACK = 100;

var Game = function(size, level) {
	Core.call(this, size, level);
	this.players = [];
};

util.inherits(Game, Core);

Game.prototype.start = function(players) {
	Core.prototype.start.call(this);

	var self = this;

	players.forEach(function(options) {
		self._addPlayer(options);
	});
};

Game.prototype.update = function(dt, players) {
	Core.prototype.update.call(this, dt);

	var self = this;
	var remove = [];

	players.forEach(function(options) {
		var player = find(self.players, { id: options.id });

		if(player) player.set(options);
		else self._addPlayer(options);
	});

	this.players.forEach(function(player) {
		var removed = !find(players, { id: player.id });
		if(removed) remove.push(player);
	});

	remove.forEach(function(player) {
		self.removeBody(player);
		remove(self.players, player);
	});
};

Game.prototype.validate = function(shooter, victim, position, direction) {
	shooter = find(this.players, { id: shooter });
	victim = find(this.players, { id: victim });

	if(!shooter || !victim) return false;

	var hit = this.hitscan(position, direction, shooter);

	if(hit.body === victim.id) return true;
	return false;
};

Game.prototype._addPlayer = function(options) {
	var player = new Player(this, options);

	this.players.push(player);
	this.addBody(player);
};

var Recorder = function(size, level) {
	this._size = size;
	this._level = level;

	this.tick = 0;
	this.updates = [];
};

Recorder.prototype.record = function(dt, players) {
	players = players.map(function(player) {
		return player.toJSON();
	});

	this.updates.push({
		tick: this.tick++,
		t: Date.now(),
		dt: dt,
		players: players
	});

	if(this.updates.length >= UPDATE_SIZE) {
		this.updates.shift();
	}
};

Recorder.prototype.validate = function(t, shooter, victim, position, direction) {
	var self = this;
	var time = t - TIME_SLACK;
	var i = this._getUpdate(time);

	if(i < 0) return false;

	var update = this.updates[i];
	var game = new Game(this._size, this._level);

	game.start(update.players);

	while((time = update.t) <= t + TIME_SLACK && ++i < this.updates.length) {
		update = this.updates[i];
		game.update(update.dt, update.players);

		if(game.validate(shooter, victim, position, direction)) {
			return true;
		}
	}

	return false;
};

Recorder.prototype._getUpdate = function(time) {
	var updates = this.updates;

	for(var i = 0; i < updates.length - 1; i++) {
		if(updates[i].t <= time && time <= updates[i + 1].t) {
			return i;
		}
	}

	return -1;
};

module.exports = Recorder;
