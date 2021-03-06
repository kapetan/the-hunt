var util = require('util');

var Player = require('./player');
var Bullet = require('./bullet');
var math = require('../math');

var UPDATES_SIZE = 60 * 2;

var noop = function() {};

var RemotePlayer = function(game, options) {
	Player.call(this, game, options);

	this.updates = [];
	this.bullets = [];
};

util.inherits(RemotePlayer, Player);

RemotePlayer.prototype.processInput = noop;

RemotePlayer.prototype.addUpdate = function(update) {
	this.updates.push(update);

	if(this.updates.length >= UPDATES_SIZE) {
		this.updates.shift();
	}
	if(update.bullet) {
		this.bullets.push(update.bullet);
	}
};

RemotePlayer.prototype.interpolate = function(time) {
	var updates = this._getUpdates(time);
	if(!updates) return;

	var next = updates.next;
	var previous = updates.previous;

	var diff = next.t - previous.t;
	var progress = diff ? (time - previous.t) / diff : 1;

	this.position = math.lerp(previous.position, next.position, progress);
	this.direction = (next.direction - previous.direction) * progress + next.direction;
	this._shoot(time);
};

RemotePlayer.prototype._getUpdates = function(time) {
	var updates = this.updates;

	for(var i = 0; i < updates.length - 1; i++) {
		if(updates[i].t < time && time < updates[i + 1].t) {
			return {
				next: updates[i + 1],
				previous: updates[i]
			};
		}
	}
};

RemotePlayer.prototype._shoot = function(time) {
	var options = this.bullets[0];
	if(!options || options.hit.t > time) return;

	this.bullets.shift();

	var hit = options.hit;
	var bullet = new Bullet(this.game, this, hit.position, options.shoot);

	bullet.move(time - hit.t);
	this.game.addBody(bullet);
};

module.exports = RemotePlayer;
