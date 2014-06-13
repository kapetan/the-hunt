var util = require('util');

var math = require('../math');
var Base = require('./base');

var FOOT_SIZE = { width: 8, height: 5 };
var FOOT_SLANT = 0.2;
var FOOT_DECAY = 0.0001;
var STRIDE_LENGTH = 15;
var FOOT_LENGTH = 4;

var FootStep = function(game, options) {
	options = options || {};
	options.size = FOOT_SIZE;
	options.direction += (options.isLeft ? -1 : 1) * FOOT_SLANT;

	Base.call(this, game, options);

	this.active = true;
	this.collidable = false;

	this.decay = (options.decay === undefined) ? FOOT_DECAY : options.decay;
	this.isLeft = !!options.isLeft;
	this.isRight = !options.isLeft;
};

util.inherits(FootStep, Base);

FootStep.prototype.update = function(dt) {
	this.visibility -= this.decay * dt;
	if(!this.isVisible()) this.game.removeBody(this);
};

FootStep.prototype.isVisible = function() {
	return this.visibility > 0;
};

var FootTrack = function(game, player) {
	this.game = game;
	this.player = player;

	this.latestLeft = false;
	this.latestPosition = { x: player.position.x, y: player.position.y };
	this.latestDirection = player.direction;
};

FootTrack.prototype.update = function(dt) {
	if(math.distance(this.player.position, this.latestPosition) >= STRIDE_LENGTH) {
		var step;

		if(this.latestLeft) {
			step = math.translate(this.latestPosition, this.latestDirection + Math.PI / 2, FOOT_LENGTH);
		} else {
			step = math.translate(this.latestPosition, this.latestDirection - Math.PI / 2, FOOT_LENGTH);
		}

		step = new FootStep(this.game, {
			position: step,
			direction: this.latestDirection,
			isLeft: !this.latestLeft
		});

		this.game.addBody(step);

		this.latestLeft = !this.latestLeft;
		this.latestPosition = { x: this.player.position.x, y: this.player.position.y };
		this.latestDirection = this.player.direction;
	}
};

module.exports = FootTrack;
