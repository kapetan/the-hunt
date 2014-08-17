var qs = require('querystring');
var Game = require('./game.client');

var options = qs.parse(window
		.location
		.search
		.replace(/^\?/, ''));

var game = new Game('canvas', options);
game.start();

window.game = game;
