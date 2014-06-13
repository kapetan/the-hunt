var Game = require('./game');

(function() {
	var game = window.game = new Game('canvas');
	game.start();
}());
