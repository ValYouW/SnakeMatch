/*
* Messages
* --------
* Pending: 1
* Ready: 2#playerIndex#boardWidth#boardHeight#cellSize
* Steady: 3#timeToStart
* Update: 4#player1Direction#player2Direction#pellets#score
*     pellets - cellIndex,cellIndex,cellIndex...
*     score - player1Score,player2Score
* PeerDisconnect: 5
*/

// This file is shared between the client and the server, in case "window" is defined we assume it is the client
if (typeof window !== 'undefined') {
	window.VYW = window.VYW || {};
	window.VYW.Protocol = {};
}

(function(Protocol) {
	// Hold some data characters (delimiters etc)
	var DATA = {
		DATA_SEP: '#',
		OBJ_SEP: ','
	};

	Protocol.Direction = {
		Up: '8',
		Right: '6',
		Down: '2',
		Left: '4'
	};

	// Expose the messages enum
	Protocol.Messages = {
		Pending: '1',
		Ready: '2',
		Steady: '3',
		Update: '4',
		PeerDisconnect: '5'
	};

	// Some Model classes
	function Message(type) {
		this.type = type;
	}

	function GetReadyMessage() {
		Message.call(this, Protocol.Messages.Ready);
		this.playerIndex = 0;
		this.boardWidth = 0;
		this.boardHeight = 0;
		this.boardCellSize = 0;
	}

	function SteadyMessage() {
		Message.call(this, Protocol.Messages.Steady);
		this.timeToStart = 0;
	}

	// Encode functions

	Protocol.buildPending = function() {
		return Protocol.Messages.Pending;
	};

	Protocol.buildReady = function(playerIndex, boardWidth, boardHeight, cellSize) {
		return [Protocol.Messages.Ready, playerIndex, boardWidth, boardHeight, cellSize].join(DATA.DATA_SEP);
	};

	Protocol.buildSteady = function(tts) {
		return [Protocol.Messages.Steady, tts].join(DATA.DATA_SEP);
	};

	Protocol.buildPeerDisconnect = function() {
		return Protocol.Messages.PeerDisconnect;
	};

	// Decode functions

	Protocol.parseMessage = function(msg) {
		// Message: "CODE#DATA"
		if (!msg) {return null;}

		var parts = msg.split(DATA.DATA_SEP);
		var code = parts.shift(); // This also removes the code from the parts array
		switch (code) {
			case Protocol.Messages.Pending:
				// No specific data for this message type
				return new Message(code);
			case Protocol.Messages.Ready:
				return Protocol.parseGetReadyMessage(parts);
			case Protocol.Messages.Steady:
				return Protocol.parseSteadyMessage(parts);
			case Protocol.Messages.Update:
				return Protocol.parseUpdateMessage(parts);
			case Protocol.Messages.PeerDisconnect:
				// No specific data for this message type
				return new Message(code);
			default:
				return null;
		}
	};

	Protocol.parseGetReadyMessage = function(data) {
		// GetReady message: playerIndex#boardWidth#boardHeight#cellSize
		// Remember that the message already got split, so we have all in the array.
		if (data.length < 4) {
			return null;
		}

		var res = new GetReadyMessage();
		res.playerIndex = parseInt(data[0]);
		res.boardWidth = parseInt(data[1]);
		res.boardHeight = parseInt(data[2]);
		res.boardCellSize = parseInt(data[3]);

		// Check that we got all positive values
		if (!res.playerIndex || !res.boardWidth || !res.boardHeight || !res.boardCellSize) {
			return null;
		} else {
			return res;
		}
	};

	Protocol.parseSteadyMessage = function(data) {
		// Steady message contains the time to start (e.g "5")
		// Remember that the message already got split, so we have all in the array.
		if (data.length < 1) {
			return null;
		}

		var res = new SteadyMessage();
		res.timeToStart = parseInt(data[0]);

		// Check that we got positive values
		if (!res.timeToStart) {
			return null;
		} else {
			return res;
		}
	};

	Protocol.parseUpdateMessage = function(data) {
		return null;
	};

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW.Protocol));
