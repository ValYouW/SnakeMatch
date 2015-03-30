var Snake = require('./game/snake.js');

var snakes = {};

var Lobby = {};
module.exports = Lobby;

Lobby.add = function (socket) {
	var snake = new Snake(socket);
	snakes[snake.id] = snake;
	snake.on(Snake.Events.Disconnect, Lobby.disconnect);
};

Lobby.disconnect = function(snake) {
	delete snakes[snake.id];
};