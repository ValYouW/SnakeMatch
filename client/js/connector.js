window.VYW = window.VYW || {};
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
			self.disconnect(Connector.GameOverReason.SocketDisconnect);
		};

		this.socket.onerror = function() {
			self.disconnect(Connector.GameOverReason.SocketError);
		};

		this.socket.onmessage = function(msg) {
			self.handleMessage(msg.data);
		};
	}

	Connector.GameOverReason = {
		PeerDisconnect: 0,
		InvalidMessage: 1,
		SocketDisconnect: 2,
		SocketError: 3
	};

	// Those functions should be overriden by those who are interested
	// We could use event emitter but no real need so save the performance...
	Connector.prototype.onConnected = function() {};
	Connector.prototype.onPendingMatch = function() {};
	Connector.prototype.onGetReady = function(boardData) {};
	Connector.prototype.onSteady = function(startIn) {};
	Connector.prototype.onGameStart = function() {};
	Connector.prototype.onGameUpdate = function(data) {};
	Connector.prototype.onGameOver = function(reason) {};

	Connector.prototype.handleMessage = function(data) {
		if (!data) {return;}

		var message = VYW.Protocol.parseMessage(data);
		if (message === null) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
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
			case VYW.Protocol.Messages.PeerDisconnect:
				this.disconnect(Connector.GameOverReason.PeerDisconnect);
				break;
			default:
				this.disconnect(Connector.GameOverReason.InvalidMessage);
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
		this.onGameOver(reason);
	};

	VYW.Connector = Connector;

}(window.VYW, window));