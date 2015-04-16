var Player = require('./game/player.js'),
	Match = require('./game/match.js'),
	protocol = require('./../common/protocol.js');

var players = {};
var matches = {};

var Lobby = {};
module.exports = Lobby;

Lobby.add = function (socket) {
	var player = new Player(socket);
	players[player.id] = player;
	player.on(Player.Events.Disconnect, Lobby.onPlayerDisconnect);
	var match = this.matchPlayers(player);
	if (match) {
		match.on(Match.Events.GameOver, Lobby.onGameOver);
		matches[match.id] = match;
		delete players[match.player1.id];
		delete players[match.player2.id];
		match.start();
	} else {
		player.send(protocol.buildPending());
	}
};

Lobby.matchPlayers = function(player2) {
	for (var player1 in players) {
		if (players[player1].id === player2.id) {continue;}
		return new Match(players[player1], player2);
	}

	return null;
};

Lobby.onPlayerDisconnect = function(player) {
	delete players[player.id];
};

Lobby.onGameOver = function(match) {
	match.player1.disconnect();
	match.player2.disconnect();
};