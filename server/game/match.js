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
var BOARD = {
	WIDTH: 500,
	HEIGHT: 500,
	CELL: 10
};

function Match(player1, player2) {
	Emitter.call(this);
	this.id = uuid.v1();
	this.gameTimer = null;
	this.steadyLeft = STEADY_WAIT;
	this.matchTime = MATCH_TIME;
	this.player1 = player1;
	this.player2 = player2;

	this.player1.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));
	this.player2.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));

	this.player1.on(Player.Events.Message, this.onPlayerMessage.bind(this));
	this.player2.on(Player.Events.Message, this.onPlayerMessage.bind(this));

	this.snakeEngine = new SnakeEngine(BOARD.WIDTH, BOARD.HEIGHT, BOARD.CELL);
}
util.inherits(Match, Emitter);

Match.Events = {
	GameOver: 'GameOver'
};

Match.prototype.start = function() {
	// Build the ready message for each player
	var msg = protocol.buildReady(1, this.snakeEngine.board, this.snakeEngine.snake1, this.snakeEngine.snake2);
	this.player1.send(msg);

	msg = protocol.buildReady(2, this.snakeEngine.board, this.snakeEngine.snake1, this.snakeEngine.snake2);
	this.player2.send(msg);

	this.steady();
};

Match.prototype.steady = function() {
	var msg;
	if (this.steadyLeft === 0) {
		msg = protocol.buildGo();
		this.player1.send(msg);
		this.player2.send(msg);
		this.gameTimer = setTimeout(this.update.bind(this), UPD_FREQ);
		return;
	}

	msg = protocol.buildSteady(this.steadyLeft);
	this.player1.send(msg);
	this.player2.send(msg);
	--this.steadyLeft;
	this.gameTimer = setTimeout(this.steady.bind(this), 1000);
};

Match.prototype.update = function() {
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
		// We don't like ties, lets add more time to the game
		if (this.snakeEngine.snake1.parts.length === this.snakeEngine.snake2.parts.length) {
			this.matchTime += MATCH_EXTENSION_TIME;
			this.gameTimer = setTimeout(this.update.bind(this), UPD_FREQ);
			this.sendUpdateMessage(res);
			return;
		}

		// Build a GameOver message
		msg = protocol.buildGameOver(protocol.GameOverReason.End, 0, this.snakeEngine.snake1, this.snakeEngine.snake2);
	} else {
		// Ok, some snake had a collision and lost, since we have only 2 players we can send a GameOver message.
		var winningPlayer = (res.loosingSnake + 2) % 2 + 1;
		msg = protocol.buildGameOver(protocol.GameOverReason.Collision, winningPlayer);
	}

	this.player1.send(msg);
	this.player2.send(msg);

	this.emit(Match.Events.GameOver, this);
};

/**
 * Sends an update message to the clients
 * @param {UpdateResponse} res
 */
Match.prototype.sendUpdateMessage = function(res) {
	var pellets = res.pelletsUpdate ? this.snakeEngine.pellets : null;
	var msg = protocol.buildUpdate(this.matchTime, this.snakeEngine.snake1, this.snakeEngine.snake2, pellets, this.snakeEngine.board);
	this.player1.send(msg);
	this.player2.send(msg);
};

Match.prototype.onPlayerDisconnect = function(player) {
	var msg = protocol.buildGameOver(protocol.GameOverReason.PeerDisconnect);
	if (this.player1.id === player.id) {
		this.player2.send(msg);
	} else {
		this.player1.send(msg);
	}

	this.gameOver();
};

Match.prototype.onPlayerMessage = function(msg) {
	var message = protocol.parseMessage(msg);
	if (!message) {
		return;
	}

	switch (message.type) {
		case protocol.Messages.ChangeDirection:
			this.snakeEngine.handleDirChangeMessage(message);
			break;
	}
};

Match.prototype.gameOver = function() {
	clearTimeout(this.gameTimer);
	this.emit(Match.Events.GameOver, this);
};

module.exports = Match;