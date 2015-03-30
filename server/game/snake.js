var Emitter = require('events').EventEmitter,
	util = require('util'),
	uuid = require('node-uuid');

function Snake(socket) {
	if (typeof socket !== 'object' || socket === null) {
		throw new Error('socket is mandatory');
	}
	Emitter.call(this);

	this.id = uuid.v1();

	socket.on('close', this.onDisconnect.bind(this));
	socket.on('error', this.onDisconnect.bind(this));
	socket.on('message', this.onMessage.bind(this));

	var start = 5;
	setInterval(function() {
		++start;
		socket.send((start%50).toString());
	}, 100);
}
util.inherits(Snake, Emitter);

Snake.Events = {
	Disconnect: 'disconnect'
};

Snake.prototype.onMessage = function(message) {
};

Snake.prototype.onDisconnect = function() {
	this.emit(Snake.Events.Disconnect, this);
};

module.exports = Snake;