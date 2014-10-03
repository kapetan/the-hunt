var qs = require('querystring');
var Game = require('./game.client');

var getElementByQuerySelector = function(root, query) {
	return root.querySelectorAll(query)[0]
};

var HUD = function(element) {
	element = document.getElementById(element);

	this.kills = getElementByQuerySelector(element, '.kills .value');
	this.deaths = getElementByQuerySelector(element, '.deaths .value');
	this.ammunition = getElementByQuerySelector(element, '.ammunition .progress');
};

HUD.prototype.update = function(attributes) {
	this.kills.textContent = attributes.kills;
	this.deaths.textContent = attributes.deaths;

	var ammunition = Math.round(attributes.ammunition * 100);
	ammunition = Math.min(100, ammunition);

	this.ammunition.style.width = ammunition + '%';
};

var options = qs.parse(window
		.location
		.search
		.replace(/^\?/, ''));

var game = new Game('canvas', options);
var hud = new HUD('hud');

game.on('update', function() {
	hud.update({
		kills: game.player.attributes.kills,
		deaths: game.player.attributes.deaths,
		ammunition: game.player.ammunition
	});
});

game.start();

window.game = game;
