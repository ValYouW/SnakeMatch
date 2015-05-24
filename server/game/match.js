var Emitter = require('events').EventEmitter,
	Player = require('./player.js'),
	SnakeEngine = require('./snake-engine.js'),
	protocol = require('./../../common/protocol.js').Protocol,
	util = require('util'),
	uuid = require('node-uuid');

var MATCH_TIME = 60000; // In milliseconds
var MATCH_EXTENSION_TIME = 10000;
var UPD_FREQ = 100;
var STEADY_WAIT = 3;
var BOARD_SIZE = {
	WIDTH: 500,
	HEIGHT: 500,
	BOX: 10
};

/**
 * Creates a new instance of Match.
 * The Match class is responsible for managing a match between 2 players in the server
 * @param {Player} player1 - The first player
 * @param {Player} player2 - The second player
 * @constructor
 */
function Match(player1, player2) {
	Emitter.call(this);
	this.id = uuid.v1();
	this.gameTimer = null;
	this.matchTime = MATCH_TIME; // The match timer (each match is for MATCH_TIME milliseconds)

	// Set the players indexes
	this.player1 = player1;
	this.player1.index = 1;
	this.player2 = player2;
	this.player2.index = 2;

	// Register to the players events
	this.player1.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));
	this.player2.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));

	this.player1.on(Player.Events.Message, this.onPlayerMessage.bind(this));
	this.player2.on(Player.Events.Message, this.onPlayerMessage.bind(this));

	// Create the snake game
	this.snakeEngine = new SnakeEngine(BOARD_SIZE.WIDTH, BOARD_SIZE.HEIGHT, BOARD_SIZE.BOX);
}
util.inherits(Match, Emitter);

/**
 * Exposed events
 */
Match.Events = {
	GameOver: 'GameOver'
};

/**
 * Starts the match
 */
Match.prototype.start = function() {
	// Build the ready message for each player
	var msg = protocol.buildReady(1, this.snakeEngine.board, this.snakeEngine.snake1, this.snakeEngine.snake2);
	this.player1.send(msg);

	msg = protocol.buildReady(2, this.snakeEngine.board, this.snakeEngine.snake1, this.snakeEngine.snake2);
	this.player2.send(msg);

	// Start the steady count down
	this.steady(STEADY_WAIT);
};

/**
 * Handles the steady count down
 * @param {number} steadyLeft - The number of steady events left
 */
Match.prototype.steady = function(steadyLeft) {
	var msg;

	// Check if steady count down finished
	if (steadyLeft === 0) {
		// Send the players a "Go" message
		msg = protocol.buildGo();
		this.player1.send(msg);
		this.player2.send(msg);

		// Starts the update events (this is the actual game)
		this.gameTimer = setTimeout(this.update.bind(this), UPD_FREQ);
		return;
	}

	// Sends the players another steady message and call this method again in 1 sec
	msg = protocol.buildSteady(steadyLeft);
	this.player1.send(msg);
	this.player2.send(msg);
	--steadyLeft;
	this.gameTimer = setTimeout(this.steady.bind(this, steadyLeft), 1000);
};

/**
 * Updates the game
 */
Match.prototype.update = function() {
	// Update the match time, this is not super precise as the "setTimeout" time is not guaranteed,
	// but ok for our purposes...
	this.matchTime -= UPD_FREQ;

	// Update the game
	var res = this.snakeEngine.update();

	// If no snake lost on this update and there is more time we just reload the update timer
	if (res.loosingSnake < 0 && this.matchTime > 0) {
		this.gameTimer = setTimeout(this.update.bind(this), UPD_FREQ);
		this.sendUpdateMessage(res);
		return;
	}

	var msg;
	// If no snake lost it means time's up, lets see who won.
	if (res.loosingSnake < 0) {
		// Check if there is a tie
		if (this.snakeEngine.snake1.parts.length === this.snakeEngine.snake2.parts.length) {
			// We don't like ties, lets add more time to the game
			this.matchTime += MATCH_EXTENSION_TIME;
			this.gameTimer = setTimeout(this.update.bind(this), UPD_FREQ);
			this.sendUpdateMessage(res);
			return;
		}

		// No tie, build a GameOver message (the client will find which player won)
		msg = protocol.buildGameOver(protocol.GameOverReason.End, null, this.snakeEngine.snake1, this.snakeEngine.snake2);
	} else {
		// Ok, some snake had a collision and lost, since we have only 2 players we can easily find the winning snake
		var winningPlayer = (res.loosingSnake + 2) % 2 + 1;
		msg = protocol.buildGameOver(protocol.GameOverReason.Collision, winningPlayer);
	}

	// Send the message to the players and raise the GameOver event
	this.player1.send(msg);
	this.player2.send(msg);

	this.emit(Match.Events.GameOver, this);
};

/**
 * Sends an update message to the clients
 * @param {GameUpdateData} updateData - Date about the game
 */
Match.prototype.sendUpdateMessage = function(updateData) {
	// Build and send an update message to all players
	var pellets = updateData.pelletsUpdate ? this.snakeEngine.pellets : null;
	var msg = protocol.buildUpdate(this.matchTime, this.snakeEngine.snake1, this.snakeEngine.snake2, pellets, this.snakeEngine.board);
	this.player1.send(msg);
	this.player2.send(msg);
};

/**
 * Handles a player disconnect event
 * @param {Player} player - The disconnected player
 */
Match.prototype.onPlayerDisconnect = function(player) {
	// We send a PeerDisconnect event to the other player
	var msg = protocol.buildGameOver(protocol.GameOverReason.PeerDisconnect);
	if (this.player1.id === player.id) {
		this.player2.send(msg);
	} else {
		this.player1.send(msg);
	}

	this.gameOver();
};

/**
 * handles a message from a player (client)
 * @param {Player} player - The player that sent the message
 * @param {string} msg - The actual message
 */
Match.prototype.onPlayerMessage = function(player, msg) {
	// Parse the message
	var message = protocol.parseMessage(msg);
	if (!message) {
		return;
	}

	switch (message.type) {
		case protocol.Messages.ChangeDirection:
			message.playerIndex = player.index;
			this.snakeEngine.handleDirChangeMessage(message);
			break;
	}
};

/**
 * Cleanup the game
 */
Match.prototype.gameOver = function() {
	clearTimeout(this.gameTimer);
	this.emit(Match.Events.GameOver, this);
};

module.exports = Match;