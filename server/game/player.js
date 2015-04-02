var Emitter = require('events').EventEmitter,
	util = require('util'),
	uuid = require('node-uuid');

function Player(socket) {
	if (typeof socket !== 'object' || socket === null) {
		throw new Error('socket is mandatory');
	}
	Emitter.call(this);

	this.id = uuid.v1();
	this.online = true;
	this.socket = socket;
	socket.on('close', this.onDisconnect.bind(this));
	socket.on('error', this.onDisconnect.bind(this));
	socket.on('message', this.onMessage.bind(this));
}
util.inherits(Player, Emitter);

Player.Events = {
	Disconnect: 'disconnect'
};

Player.prototype.send = function(msg) {
	if (!msg || !this.online) {
		return;
	}

	try {
		this.socket.send(msg);
	} catch (ignore) {}
};

Player.prototype.disconnect = function() {
	try {
		this.socket.close();
	} catch (ignore) {}
};

Player.prototype.onMessage = function(message) {
};

Player.prototype.onDisconnect = function() {
	this.online = false;
	this.emit(Player.Events.Disconnect, this);
};

module.exports = Player;