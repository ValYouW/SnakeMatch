window.VYW = window.VYW || {};
(function(VYW, win) {
	var PROTOCOL = {
		DATA_SEP: '#',
		OBJ_SEP: ',',
		PENDING: '1',
		READY: '2',
		STEADY: '3',
		GO: '4',
		UPDATE: '5',
		PEER_DISCONNECT: '6'
	};

	function Connector(host) {
		if (typeof host !== 'string' || !host) {
			throw new Error('host is mandatory');
		}

		var self = this;
		this.socket = new win.WebSocket('ws://' + host);
		this.socket.onopen = function() {
			// "raise" the pending match event
			self.onPendingMatch();
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

	Connector.prototype.handleMessage = function(msg) {
		// Message: "CODE#DATA"
		if (!msg) {return;}

		var parts = msg.split(PROTOCOL.DATA_SEP);
		var code = parts.shift(); // This also removes the code from the parts array
		switch (code) {
			case PROTOCOL.READY:
				this.parseGetReadyMessage(parts);
				break;
			case PROTOCOL.STEADY:
				this.parseSteadyMessage(parts);
				break;
			case PROTOCOL.GO:
				this.onGameStart();
				break;
			case PROTOCOL.UPDATE:
				this.parseUpdateMessage(parts);
				break;
			case PROTOCOL.PEER_DISCONNECT:
				this.disconnect(Connector.GameOverReason.PeerDisconnect);
				break;
			default:
				this.disconnect(Connector.GameOverReason.InvalidMessage);
		}
	};

	Connector.prototype.parseGetReadyMessage = function(data) {
		// GetReady message contains the board sizes "width#height#cellSize" (e.g "500#500#10")
		// Remember that the message already got split, so we have all in the array.
		if (data.length < 3) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
			return;
		}

		var board = {
			width: 0,
			height: 0,
			cellSize: 0
		};

		board.width = parseInt(data[0]);
		board.height = parseInt(data[1]);
		board.cellSize = parseInt(data[2]);

		// Check that we got all positive values
		if (!board.width || !board.height || !board.cellSize) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
		} else {
			this.onGetReady(board);
		}
	};

	Connector.prototype.parseSteadyMessage = function(data) {
		// Steady message contains the time to start (e.g "5")
		// Remember that the message already got split, so we have all in the array.
		if (data.length < 1) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
			return;
		}

		var startIn = parseInt(data[0]);

		// Check that we got positive values
		if (!startIn) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
		} else {
			this.onSteady(startIn);
		}
	};

	Connector.prototype.parseUpdateMessage = function(data) {
		// Update message data is: "HomeSnakeData#AwaySnakeData#Pellets#Score"
		// Remember that the message already got split, so we have all in the array.
		if (data.length < 1) {
			return;
		}

		var update = {
			home: null,
			away: null,
			pellets: null,
			score: null
		};

		// Will hold whether we had protocol error
		var error = false;

		// This is home snake
		if (data[0] !== '') {
			update.home = this.parseLocations(data[0]);
			error = update.home === null;
		}

		// Next is away snake
		if (!error && data.length > 1 && data[1] !== '') {
			update.away = this.parseLocations(data[1]);
			error = update.away === null;
		}

		// Next is pellets
		if (!error && data.length > 2 && data[2] !== '') {
			update.pellets = this.parseLocations(data[2]);
			error = update.pellets === null;
		}

		// Next is score
		if (!error && data.length > 3 && data[3] !== '') {
			update.score = this.parseScore(data[3]);
			error = update.score === null;
		}

		// Raise the appropriate message
		if (error) {
			this.disconnect(Connector.GameOverReason.InvalidMessage);
		} else {
			this.onGameUpdate(update);
		}
	};

	Connector.prototype.parseLocations = function(data) {
		// location string is a set of "x,y" (e.g "12,34,14,34,16,36,16,38")
		var locations = data.split(PROTOCOL.OBJ_SEP);
		if (locations.length % 2 > 0) {
			return null;
		}

		var res = [];
		for (var i = 0; i < locations.length; i += 2) {
			res.push({x: locations.length[i], y: locations.length[i+1]});
		}

		return res;
	};

	Connector.prototype.parseScore = function(data) {
		// Score is "home,away" (e.g "12,8")
		var scores = data.split(PROTOCOL.OBJ_SEP);
		if (scores.length !== 2) {
			return null;
		}

		return {home: scores[0], away: scores[1]};
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

	// Those functions should be overriden by those who are interested
	// We could use event emitter but no real need so save the performance...
	Connector.prototype.onPendingMatch = function() {};
	Connector.prototype.onGetReady = function(boardData) {};
	Connector.prototype.onSteady = function(startIn) {};
	Connector.prototype.onGameStart = function() {};
	Connector.prototype.onGameUpdate = function(data) {};
	Connector.prototype.onGameOver = function(reason) {};

	VYW.Connector = Connector;

}(window.VYW, window));