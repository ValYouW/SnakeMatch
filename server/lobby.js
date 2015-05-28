/*
 * The Lobby is responsible for accepting new players, and pairing players into matches
 */
var Player = require('./game/player.js'),
	Match = require('./game/match.js'),
	protocol = require('./../common/protocol.js').Protocol;

// A dictionary of pending players and active matches
var pendingPlayers = {};
var activeMatches = {};

var Lobby = {};
module.exports = Lobby;

/**
 * Adds a new client to the lobby
 * @param {WebSocket} socket - The client socket
 */
Lobby.add = function (socket) {
	// Create a new Player, add it to the pending players dictionary and register to its disconnect event
	var player = new Player(socket);
	pendingPlayers[player.id] = player;
	player.on(Player.Events.Disconnect, Lobby.onPlayerDisconnect);

	// Try to pair this player with other pending players, if success we get a "match"
	var match = this.matchPlayers(player);
	if (match) {
		// Register the Match GameOver event and store the match in the active matches dictionary
		match.on(Match.Events.GameOver, Lobby.onGameOver);
		activeMatches[match.id] = match;

		// Remove the players in the match from the pending players
		delete pendingPlayers[match.player1.id];
		delete pendingPlayers[match.player2.id];

		// Start the match
		match.start();
	} else {
		// No match found for this player, let him know he is Pending
		player.send(protocol.buildPending());
	}
};

/**
 * Try to pair a new player with a pending player for a match
 * @param {Player} newPlayer - The new player
 * @returns {Match}
 */
Lobby.matchPlayers = function(newPlayer) {
	// Loop thru the pending players
	for (var currPlayer in pendingPlayers) {
		// If the current player os the new player, skip (obviously one can not be paired with itself)
		if (pendingPlayers[currPlayer].id === newPlayer.id) {continue;}

		// Found a pair, create a Match
		return new Match(pendingPlayers[currPlayer], newPlayer);
	}

	return null;
};

/**
 * Handles a player socket disconnect
 * @param {Player} player
 */
Lobby.onPlayerDisconnect = function(player) {
	// Just remove him from the pending
	delete pendingPlayers[player.id];
};

/**
 * Handles a match game over
 * @param {Match} match - The Match that was ended
 */
Lobby.onGameOver = function(match) {
	// Disconnect the players and delete the match
	match.player1.disconnect();
	match.player2.disconnect();
	delete activeMatches[match.id];
};