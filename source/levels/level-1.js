var wall = require('./wall');
var Fog = require('./fog');

module.exports = function(game) {
	var fog = new Fog(game);
	game.addBody(fog);

	var segment = wall(game, { x: 300, y: 100 }, [{ direction: 1.2, length: 50 }, { direction: 1, length: 50 }, { direction: 0.7, length: 50 }]);
	wall(game, { x: segment.x + 50, y: segment.y + 50 }, [{ direction: 1, length: 50 }, { direction: 1.3, length: 50 }]);

	return {
		fog: fog
	};
};
