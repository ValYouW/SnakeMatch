var Emitter = require('events').EventEmitter,
	util = require('util'),
	uuid = require('node-uuid');

/**
 * Creates a new instance of Player
 * The Player class is wrapping a client socket
 * @param {WebSocket} socket - The client's socket
 * @extends {EventEmitter}
 * @constructor
 */
function Player(socket) {
	// Make sure we got a socket
	if (typeof socket !== 'object' || socket === null) {
		throw new Error('socket is mandatory');
	}

	Emitter.call(this);

	this.id = uuid.v1();
	this.index = 0; // The player index within the game (will be set by the Match class)
	this.online = true;
	this.socket = socket;

	// Register to the socket events
	socket.on('close', this.onDisconnect.bind(this));
	socket.on('error', this.onDisconnect.bind(this));
	socket.on('message', this.onMessage.bind(this));
}
util.inherits(Player, Emitter);

/**
 * Events exposed by this class
 */
Player.Events = {
	Disconnect: 'disconnect',
	Message: 'message'
};

/**
 * Sends a message to the player client
 * @param {string} msg - The message to send
 */
Player.prototype.send = function(msg) {
	if (!msg || !this.online) {
		return;
	}

	try {
		this.socket.send(msg);
	} catch (ignore) {}
};

/**
 * handles a disconnect event of the client
 */
Player.prototype.disconnect = function() {
	try {
		this.socket.close();
	} catch (ignore) {}
};

/**
 * Handles a new message event from the client
 * @param {string} message - The message
 */
Player.prototype.onMessage = function(message) {
	if (message) {
		this.emit(Player.Events.Message, this, message);
	}
};

/**
 * Handles a client disconnect event
 */
Player.prototype.onDisconnect = function() {
	this.online = false;
	this.emit(Player.Events.Disconnect, this);
};

module.exports = Player;