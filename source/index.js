var Game = require('./game.client');

(function() {
	var game = window.game = new Game('canvas');
	game.start();
}());
