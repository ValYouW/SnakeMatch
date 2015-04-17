(function(VYW, win) {

	function Connector(host) {
		if (typeof host !== 'string' || !host) {
			throw new Error('host is mandatory');
		}

		var self = this;
		this.socket = new win.WebSocket('ws://' + host);
		this.socket.onopen = function() {
			// "raise" the onConnected event
			self.onConnected();
		};

		this.socket.onclose = function() {
			self.disconnect(Connector.DisconnectReason.SocketDisconnect);
		};

		this.socket.onerror = function() {
			self.disconnect(Connector.DisconnectReason.SocketError);
		};

		this.socket.onmessage = function(msg) {
			self.handleMessage(msg.data);
		};
	}

	Connector.DisconnectReason = {
		InvalidMessage: 0,
		SocketDisconnect: 1,
		SocketError: 2
	};

	// Those functions should be overriden by those who are interested
	// We could use event emitter but no real need so save the performance...
	Connector.prototype.onConnected = function() {};
	Connector.prototype.onDisconnect = function(reason) {};
	Connector.prototype.onPendingMatch = function() {};
	Connector.prototype.onGetReady = function(boardData) {};
	Connector.prototype.onSteady = function(startIn) {};
	Connector.prototype.onGameStart = function() {};
	Connector.prototype.onGameUpdate = function(data) {};
	Connector.prototype.onGameOver = function(reason, winningPlayerIndex) {};

	Connector.prototype.handleMessage = function(data) {
		if (!data) {return;}

		var message = VYW.Protocol.parseMessage(data);
		if (message === null) {
			this.disconnect(Connector.DisconnectReason.InvalidMessage);
			return;
		}

		switch (message.type) {
			case VYW.Protocol.Messages.Pending:
				this.onPendingMatch(message);
				break;
			case VYW.Protocol.Messages.Ready:
				this.onGetReady(message);
				break;
			case VYW.Protocol.Messages.Steady:
				this.onSteady(message);
				break;
			case VYW.Protocol.Messages.Go:
				this.onGameStart();
				break;
			case VYW.Protocol.Messages.Update:
				this.onGameUpdate(message);
				break;
			case VYW.Protocol.Messages.GameOver:
				this.onGameOver(message.reason, message.winningPlayer);
				break;
			default:
				this.disconnect(Connector.DisconnectReason.InvalidMessage);
		}
	};

	Connector.prototype.disconnect = function(reason) {
		if (!this.socket) {return;}

		// Remove all event listeners
		this.socket.onclose = null;
		this.socket.onerror = null;
		this.socket.onmessage = null;

		// Close the socket
		this.socket.close();

		// "raise" the gameOver event
		this.onDisconnect(reason);
	};

	VYW.Connector = Connector;

}(window.VYW, window));