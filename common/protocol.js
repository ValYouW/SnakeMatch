/*
* Messages
* --------
* Pending: 1
* Ready: 2#playerIndex#boardWidth#boardHeight#cellSize
* Steady: 3#timeToStart
* Update: 4#player1Direction#player2Direction#pellets#score
*   pellets - cellIndex,cellIndex,cellIndex...
*   score - player1Score,player2Score
* Go: 5
* GameOver: 6#Reason#ExtraData...
*   PeerDisconnect - No extra data
*   Collision - winningPlayerIndex
*   End - player1Score#player2Score
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

	Protocol.GameOverReason = {
		PeerDisconnect: '1',
		Collision: '2',
		End: '3'
	};

	// Expose the messages enum
	Protocol.Messages = {
		Pending: '1',
		Ready: '2',
		Steady: '3',
		Go: '4',
		Update: '5',
		GameOver: '6'
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

	function GameOverMessage(reason) {
		Message.call(this, Protocol.Messages.GameOver);
		this.reason = reason;
		this.winningPlayer = 0;
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

	Protocol.buildGo = function() {
		return Protocol.Messages.Go;
	};

	Protocol.buildGameOver = function(reason, winningPlayerIndex, player1Score, player2Score) {
		var msg;
		switch (reason) {
			case Protocol.GameOverReason.PeerDisconnect:
				msg = [Protocol.Messages.GameOver, reason].join(DATA.DATA_SEP);
				break;
			case Protocol.GameOverReason.Collision:
				msg = [Protocol.Messages.GameOver, reason, winningPlayerIndex].join(DATA.DATA_SEP);
				break;
			case Protocol.GameOverReason.End:
				msg = [Protocol.Messages.GameOver, reason, player1Score, player2Score].join(DATA.DATA_SEP);
				break;
			default:
				msg = null;
		}

		return msg;
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
			case Protocol.Messages.Go:
				// No specific data for this message type
				return new Message(code);
			case Protocol.Messages.Update:
				return Protocol.parseUpdateMessage(parts);
			case Protocol.Messages.GameOver:
				// No specific data for this message type
				return Protocol.parseGameOverMessage(parts);
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

	Protocol.parseGameOverMessage = function(data) {
		// GameOver message contains Reason#Extradata
		if (data.length < 1) {
			return null;
		}

		var reason = data[0];
		var res = new GameOverMessage(reason);
		switch (reason) {
			case Protocol.GameOverReason.PeerDisconnect:
				return res;
			case Protocol.GameOverReason.Collision:
				// In case of collision we expect another cell with the winning player index
				if (data.length < 2) {
					return null;
				}
				res.winningPlayer = parseInt(data[1]);
				if (!res.winningPlayer || res.winningPlayer < 1 || res.winningPlayer > 2) {
					return null;
				}
				return res;
			case Protocol.GameOverReason.End:
				// In case of game end we expect 2 more cells with the scores
				if (data.length < 3) {
					return null;
				}

				var player1Score = parseInt(data[1]);
				var player2Score = parseInt(data[2]);
				// The reason we check isNaN instead of (!player1Score) is that 0 is a valid value for this field
				if (isNaN(player1Score) || isNaN(player2Score)) {
					return null;
				}

				// For simplicity tie is not an option
				res.winningPlayer = player1Score > player2Score ? 1 : 2;
				return res;
			default:
				return null;
		}
	};

	Protocol.parseUpdateMessage = function(data) {
		return null;
	};

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW.Protocol));
