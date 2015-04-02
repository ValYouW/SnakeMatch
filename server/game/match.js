var Emitter = require('events').EventEmitter,
	Player = require('./player.js'),
	protocol = require('./protocol.js'),
	util = require('util'),
	uuid = require('node-uuid');

var UPD_FREQ = 100;
var BOARD = {
	WIDTH: 500,
	HEIGHT: 500,
	CELL: 10
};

function Match(player1, player2) {
	Emitter.call(this);
	this.id = uuid.v1();
	this.gameTimer = null;
	this.steadyLeft = 5;
	this.player1 = player1;
	this.player2 = player2;

	this.player1.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));
	this.player2.on(Player.Events.Disconnect, this.onPlayerDisconnect.bind(this));
}
util.inherits(Match, Emitter);

Match.Events = {
	GameOver: 'GameOver'
};

Match.prototype.start = function() {
	// Build the ready message for each player
	var msg = protocol.buildReady(1, BOARD.WIDTH, BOARD.HEIGHT, BOARD.CELL);
	this.player1.send(msg);

	msg = protocol.buildReady(2, BOARD.WIDTH, BOARD.HEIGHT, BOARD.CELL);
	this.player2.send(msg);

	this.steady();
};

Match.prototype.steady = function() {
	if (this.steadyLeft === 0) {
		this.update();
		return;
	}

	var msg = protocol.buildSteady(this.steadyLeft);
	this.player1.send(msg);
	this.player2.send(msg);
	--this.steadyLeft;
	this.gameTimer = setTimeout(this.steady.bind(this), 1000);
};

Match.prototype.update = function() {
	var gameOver = false;

	if (gameOver) {
		this.emit(Match.Events.GameOver, this);
	}

	setTimeout(this.update.bind(this), UPD_FREQ);
};

Match.prototype.onPlayerDisconnect = function(player) {
	var msg = protocol.buildPeerDisconnect();
	if (this.player1.id === player.id) {
		this.player2.send(msg);
	} else {
		this.player1.send(msg);
	}
};

Match.prototype.gameOver = function() {
	clearTimeout(this.gameTimer);
	this.emit(Match.Events.GameOver, this);
};

module.exports = Match;