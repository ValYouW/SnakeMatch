/**
 * The protocol class expose methods for encoding/decoding the client/server messages,
 * we could just use JSON.stringify/parse, but that wouldn't be efficient if we will increase the update freq
 */
(function(parent) {
	var Protocol = {};

	// Hold some data characters (delimiters etc)
	var DATA_SEP = '#',
		OBJ_SEP = ',';

	/**
	 * Player direction enum
	 */
	Protocol.Direction = {
		Up: '8',
		Right: '6',
		Down: '2',
		Left: '4'
	};

	/**
	 * Game over reason
	 */
	Protocol.GameOverReason = {
		PeerDisconnect: '1',
		Collision: '2',
		End: '3'
	};

	/**
	 * Server messages enum
	 */
	Protocol.Messages = {
		Pending: '1',
		Ready: '2',
		Steady: '3',
		Go: '4',
		Update: '5',
		GameOver: '6',
		ChangeDirection: '7'
	};

	// ------------- Model Classes -------------

	/**
	 * Creates a new message
	 * @param {string} type - The message type
	 * @constructor
	 */
	function Message(type) {
		this.type = type;
	}

	/**
	 * @constructor
	 * @extends {Message}
	 */
	function GetReadyMessage() {
		Message.call(this, Protocol.Messages.Ready);
		this.playerIndex = 0;
		this.board = { width: 0, height: 0, cellSize: 0 };
		this.snake1 = { x: 0, y: 0, size: 0, direction: 0 };
		this.snake2 = { x: 0, y: 0, size: 0, direction: 0 };
	}

	/**
	 * @constructor
	 * @extends {Message}
	 */
	function SteadyMessage() {
		Message.call(this, Protocol.Messages.Steady);
		this.timeToStart = 0;
	}

	/**
	 * @constructor
	 * @extends {Message}
	 */
	function GameOverMessage(reason) {
		Message.call(this, Protocol.Messages.GameOver);
		this.reason = reason;
		this.player1Score = -1;
		this.player2Score = -1;
		this.winningPlayer = 0;
	}

	/**
	 * @constructor
	 * @extends {Message}
	 */
	function UpdateMessage() {
		Message.call(this, Protocol.Messages.Update);
		this.timeToEnd = -1;
		this.player1Direction = '';
		this.player2Direction = '';
		this.player1Size = 0;
		this.player2Size = 0;
		this.pellets = null;
		this.player1Score = 0;
		this.player2Score = 0;
	}

	/**
	 * @constructor
	 * @extends {Message}
	 */
	function ChangeDirMessage() {
		Message.call(this, Protocol.Messages.ChangeDirection);
		this.playerIndex = 0;
		/* @type {Protocol.Direction} */
		this.newDirection = 0;
	}

	// ------------- End Model Classes -------------

	// ------------- Encode Functions -------------

	Protocol.buildPending = function() {
		// Pending msg: 1
		return Protocol.Messages.Pending;
	};

	/**
	 * Builds a ready message
	 * @param {number} playerIndex - The index given to that player (either he is player1 or 2).
	 * @param {Board} board - The board game object
	 * @param {Snake} snake1
	 * @param {Snake} snake2
	 * @returns {string}
	 */
	Protocol.buildReady = function(playerIndex, board, snake1, snake2) {
		// Ready msg: 2#playerIndex#boardWidth#boardHeight#cellSize#snake1#snake2
		// snake: x,y,size,direction
		var msg = Protocol.Messages.Ready + DATA_SEP + playerIndex + DATA_SEP + board.rectangle.width + DATA_SEP + board.rectangle.height + DATA_SEP + board.boxSize + DATA_SEP;
		msg += snake1.parts[0].location.x + OBJ_SEP + snake1.parts[0].location.y + OBJ_SEP + snake1.parts.length + OBJ_SEP + snake1.direction + DATA_SEP;
		msg += snake2.parts[0].location.x + OBJ_SEP + snake2.parts[0].location.y + OBJ_SEP + snake2.parts.length + OBJ_SEP + snake2.direction;
		return msg;
	};

	/**
	 * Builds a steady message
	 * @param {number} tts - The time-to-start
	 * @returns {string}
	 */
	Protocol.buildSteady = function(tts) {
		// Steady msg: 3#timeToStart
		return Protocol.Messages.Steady + DATA_SEP + tts;
	};

	/**
	 * Builds a go message
	 * @returns {string}
	 */
	Protocol.buildGo = function() {
		// Go msg: 4
		return Protocol.Messages.Go;
	};

	/**
	 * Builds an update message
	 * @param {number} tte - The time-to-end of the game
	 * @param {Snake} snake1
	 * @param {Snake} snake2
	 * @param {Pellet[]} pellets
	 * @param {Board} board
	 * @returns {string}
	 */
	Protocol.buildUpdate = function(tte, snake1, snake2, pellets, board) {
		// Update msg: 5#timeToEnd#playersDirection#snakesSize#pellets#score
		// playersDirection - player1Direction,player2Direction
		// snakeSizes - snake1Size,snake2Size
		// pellets - cellIndex,cellIndex,cellIndex...
		// score - player1Score,player2Score

		var msg = Protocol.Messages.Update + DATA_SEP + tte + DATA_SEP + snake1.direction + OBJ_SEP + snake2.direction + DATA_SEP;
		msg += snake1.parts.length + OBJ_SEP + snake2.parts.length + DATA_SEP;

		// Now add the pellets
		if (pellets) {
			var currPellet;
			var delim;
			for (var i = 0; i < pellets.length; ++i) {
				currPellet = pellets[i];
				delim = (i === pellets.length - 1) ? '' : OBJ_SEP; // Don't add separator for the last element
				msg += board.toBoxIndex(currPellet.location.x, currPellet.location.y) + delim;
			}
		}

		// Finally add the score
		msg += DATA_SEP + snake1.parts.length + OBJ_SEP + snake2.parts.length;

		return msg;
	};

	/**
	 * Builds the game over message
	 * @param {GameOverReason} reason - The reason why the game has ended
	 * @param {number} [winningPlayerIndex] - Optional, The index of the winning player (either 1 or 2)
	 * @param [snake1] - Optional. The first snake
	 * @param [snake2] - Optional. The second snake
	 * @returns {string}
	 */
	Protocol.buildGameOver = function(reason, winningPlayerIndex, snake1, snake2) {
		// GameOver: 6#Reason#ExtraData...
		//   PeerDisconnect - No extra data
		//   Collision - winningPlayerIndex
		//   End - player1Score#player2Score
		var msg;
		switch (reason) {
			case Protocol.GameOverReason.PeerDisconnect:
				msg = Protocol.Messages.GameOver + DATA_SEP + reason;
				break;
			case Protocol.GameOverReason.Collision:
				msg = Protocol.Messages.GameOver + DATA_SEP + reason + DATA_SEP + winningPlayerIndex;
				break;
			case Protocol.GameOverReason.End:
				msg = Protocol.Messages.GameOver + DATA_SEP + reason + DATA_SEP + snake1.parts.length + DATA_SEP + snake2.parts.length;
				break;
			default:
				msg = null;
		}

		return msg;
	};

	/**
	 * Builds a change-direction message (this is from the client to the server)
	 * @param {Direction} newDir - The new direction
	 * @returns {string}
	 */
	Protocol.buildChangeDirection = function(newDir) {
		// ChangeDirection: 7#newDirection
		return Protocol.Messages.ChangeDirection + DATA_SEP + newDir;
	};

	// ------------- End Encode Functions -------------

	// ------------- Decode Functions -------------

	/**
	 * Parse a message
	 * @param {string} msg - The message
	 * @returns {Message}
	 */
	Protocol.parseMessage = function(msg) {
		// Message: "CODE#DATA"
		if (!msg) {return null;}

		var parts = msg.split(DATA_SEP);
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
			case Protocol.Messages.ChangeDirection:
				return Protocol.parseChangeDirectionMessage(parts);
			default:
				return null;
		}
	};

	/**
	 * Parse a get ready message
	 * @param {string} data - The encoded message
	 * @returns {GetReadyMessage}
	 */
	Protocol.parseGetReadyMessage = function(data) {
		// GetReady data: playerIndex#boardWidth#boardHeight#cellSize#snake1#snake2
		// snake: x,y,size,direction

		// Remember that the message already got split, so we have all in the array.
		if (data.length < 6) {
			return null;
		}

		var res = new GetReadyMessage();

		// Parse player index and board data
		res.playerIndex = parseInt(data[0]);
		res.board.width = parseInt(data[1]);
		res.board.height = parseInt(data[2]);
		res.board.cellSize = parseInt(data[3]);

		// Check that we got all positive values
		if (!res.playerIndex || !res.board.width || !res.board.height || !res.board.cellSize) {
			return null;
		}

		// Snake 1
		var snakeData = data[4].split(OBJ_SEP);
		if (snakeData.length < 4) {
			return null;
		}

		res.snake1.x = parseInt(snakeData[0]);
		res.snake1.y = parseInt(snakeData[1]);
		res.snake1.size = parseInt(snakeData[2]);
		res.snake1.direction = snakeData[3];

		// validate, x/y can be 0 that's why we check isNaN and not just (!res.snake1.x)
		if (isNaN(res.snake1.x) || isNaN(res.snake1.y) || !res.snake1.size || !res.snake1.direction) {
			return null;
		}

		// Snake 2
		snakeData = data[5].split(OBJ_SEP);
		if (snakeData.length < 4) {
			return null;
		}

		res.snake2.x = parseInt(snakeData[0]);
		res.snake2.y = parseInt(snakeData[1]);
		res.snake2.size = parseInt(snakeData[2]);
		res.snake2.direction = snakeData[3];

		// validate, x/y can be 0 that's why we check isNaN and not just (!res.snake1.x)
		if (isNaN(res.snake2.x) || isNaN(res.snake2.y) || !res.snake2.size || !res.snake2.direction) {
			return null;
		}

		return res;
	};

	/**
	 * Parse a steady message
	 * @param {string} data - The encoded message
	 * @returns {SteadyMessage}
	 */
	Protocol.parseSteadyMessage = function(data) {
		// Steady data: time to start (e.g "5")
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

	/**
	 * Parse a game over message
	 * @param {string} data - The encoded message
	 * @returns {GameOverMessage}
	 */
	Protocol.parseGameOverMessage = function(data) {
		// GameOver data: Reason#Extradata
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

				res.player1Score = parseInt(data[1]);
				res.player2Score = parseInt(data[2]);
				// The reason we check isNaN instead of (!player1Score) is that 0 is a valid value for this field
				if (isNaN(res.player1Score) || isNaN(res.player2Score)) {
					return null;
				}

				// For simplicity tie is not an option
				res.winningPlayer = res.player1Score > res.player2Score ? 1 : 2;

				return res;
			default:
				return null;
		}
	};

	/**
	 * Parse an update message
	 * @param {string} data - The encoded message
	 * @returns {UpdateMessage}
	 */
	Protocol.parseUpdateMessage = function(data) {
		// Update data: timeToEnd#playersDirection#snakesSize#pellets#score
		// playersDirection - player1Direction,player2Direction
		// snakeSizes - snake1Size,snake2Size
		// pellets - cellIndex,cellIndex,cellIndex...
		// score - player1Score,player2Score

		if (data.length < 5) {
			return null;
		}

		var res = new UpdateMessage();

		// Parse tte
		res.timeToEnd = parseInt(data[0]);
		if (isNaN(res.timeToEnd)) {
			return null;
		}

		// Parse players directions
		var dirs = data[1].split(OBJ_SEP);
		if (dirs.length < 2) {
			return null;
		}

		res.player1Direction = dirs[0];
		res.player2Direction = dirs[1];

		// Parse players sizes
		var sizes = data[2].split(OBJ_SEP);
		if (sizes.length < 2) {
			return null;
		}

		res.player1Size = parseInt(sizes[0]);
		res.player2Size = parseInt(sizes[1]);
		if (!res.player1Size || !res.player1Size) {
			return null;
		}

		// Parse pellets (if we have)
		if (data[3]) {
			res.pellets = [];
			var pellets = data[3].split(OBJ_SEP);
			for (var i = 0; i < pellets.length; ++i) {
				res.pellets.push(pellets[i]);
			}
		}

		// Parse players scores
		var scores = data[4].split(OBJ_SEP);
		if (scores.length < 2) {
			return null;
		}

		res.player1Score = parseInt(scores[0]);
		res.player2Score = parseInt(scores[1]);
		// The reason we check isNaN instead of (!player1Score) is that 0 is a valid value for this field
		if (isNaN(res.player1Score) || isNaN(res.player2Score)) {
			return null;
		}

		return res;
	};


	/**
	 * Parse a change direction message
	 * @param {string} data - The encoded message
	 * @returns {ChangeDirMessage}
	 */
	Protocol.parseChangeDirectionMessage = function(data) {
		// ChangeDirection data: newDirection

		if (data.length < 1) {
			return null;
		}

		var res = new ChangeDirMessage();
		res.newDirection = data[0];

		if (!res.newDirection) {
			return null;
		}

		return res;
	};

	// ------------- End Decode Functions -------------

	parent.Protocol = Protocol;

// This file is shared between the client and the server, in case "window" is defined we assume it is the client
}(typeof window === 'undefined' ? module.exports : window.VYW));
