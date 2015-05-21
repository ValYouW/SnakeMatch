/**
 * The client-side game engine
 */
(function(VYW, win) {

	/**
	 * Creates a new snake game
	 * @param {object} canvas - The Canvas DOM element
	 * @param {VYW.Connector} connector - A connector object
	 * @param {object} [settings] - The game settings
	 * @constructor
	 */
	function SnakeEngine(canvas, connector, settings) {
		this.canvas = canvas;
		this.connector = connector;
		this.graphics = new VYW.Graphics(canvas);
		this.settings = new VYW.GameSettings(settings);

		// Game objects
		this.board = null;
		this.snake1 = null;
		this.snake2 = null;
		this.pellets = [];
		this.gameState = new VYW.GameState(this.settings);

		// Bind to connector events
		this.connector.onConnected = this.handleConnectedMessage.bind(this);
		this.connector.onDisconnect = this.handleDisconnectMessage.bind(this);
		this.connector.onPendingMatch = this.handlePendingMatchMessage.bind(this);
		this.connector.onGetReady = this.handleReadyMessage.bind(this);
		this.connector.onSteady = this.handleSteadyMessage.bind(this);
		this.connector.onGameStart = this.handleGameStartMessage.bind(this);
		this.connector.onGameUpdate = this.handleGameUpdateMessage.bind(this);
		this.connector.onGameOver = this.handleGameOverMessage.bind(this);

		// Bind to the window key-down event
		win.onkeydown = this.handleKeyDown.bind(this);
	}

	/**
	 * Handles connected message
	 */
	SnakeEngine.prototype.handleConnectedMessage = function() {
		this.gameState.state = VYW.GameState.GameState.Connected;

		// Start the draw loop
		this.draw();
	};

	/**
	 * Handles disconnect message
	 * @param {Connector.DisconnectReason} reason - The disconnet reason
	 */
	SnakeEngine.prototype.handleDisconnectMessage = function(reason) {
		// If GameOver we ignore the disconnect, it is ok as the server kick us on game over
		if (this.gameState.state !== VYW.GameState.GameState.GameOver) {
			this.gameState.state = VYW.GameState.GameState.Disconnected;
		}
	};

	/**
	 * Handles a pending match message
	 */
	SnakeEngine.prototype.handlePendingMatchMessage = function() {
		this.gameState.state = VYW.GameState.GameState.Pending;
	};

	/**
	 * Handles a ready message from the server
	 * @param {GetReadyMessage} data
	 */
	SnakeEngine.prototype.handleReadyMessage = function(data) {
		// Set some game data
		this.gameState.state = VYW.GameState.GameState.Ready;

		// Set this client player index (either he is player1 or player2)
		this.gameState.playerIndex = data.playerIndex;

		// Create the board and adjust canvas size
		this.board = new VYW.Board(data.board.width, data.board.height, data.board.cellSize, this.settings.boardColor);
		this.canvas.width = data.board.width;
		this.canvas.height = data.board.height;

		// Create the snakes (we assume the home player is snake1, will switch color later if not)
		this.snake1 = new VYW.Snake(data.snake1.x, data.snake1.y, data.board.cellSize, data.snake1.size, data.snake1.direction, this.settings.homeSnakeColor);
		this.snake2 = new VYW.Snake(data.snake2.x, data.snake2.y, data.board.cellSize, data.snake2.size, data.snake2.direction, this.settings.awaySnakeColor);

		// If the home snake is not player1 switch.
		if (data.playerIndex !== 1) {
			this.snake1.color = this.settings.awaySnakeColor;
			this.snake2.color = this.settings.homeSnakeColor;
		}
	};

	/**
	 * Handles a steady message from the server
	 * @param {SteadyMessage} steadyMessage
	 */
	SnakeEngine.prototype.handleSteadyMessage = function(steadyMessage) {
		this.gameState.state = VYW.GameState.GameState.Steady;
		this.gameState.startIn = steadyMessage.timeToStart;
	};

	/**
	 * Handles a game start message
	 */
	SnakeEngine.prototype.handleGameStartMessage = function() {
		this.gameState.startIn = 0;
		this.gameState.state = VYW.GameState.GameState.Running;
	};

	/**
	 * Handles update message
	 * @param {UpdateMessage} data - Some game data from the server
	 */
	SnakeEngine.prototype.handleGameUpdateMessage = function(data) {
		// Update game data
		this.gameState.player1Score = data.player1Score;
		this.gameState.player2Score = data.player2Score;
		this.gameState.timeToEnd = data.timeToEnd;

		// Update players
		this.snake1.direction = data.player1Direction;
		this.snake1.update(data.player1Size);
		this.snake2.direction = data.player2Direction;
		this.snake2.update(data.player2Size);

		// Update pellets
		if (data.pellets) {
			this.pellets = [];
			for (var i = 0; i < data.pellets.length; ++i) {
				var loc = this.board.toScreen(data.pellets[i]);
				this.pellets.push(new VYW.Pellet(loc, this.settings.pelletColor));
			}
		}
	};

	/**
	 * Handles a game over message
	 * @param {GameOverMessage} data - The game results
	 */
	SnakeEngine.prototype.handleGameOverMessage = function(data) {
		this.gameState.state = VYW.GameState.GameState.GameOver;
		this.gameState.player1Score = data.player1Score >= 0 ? data.player1Score : this.gameState.player1Score;
		this.gameState.player2Score = data.player2Score >= 0 ? data.player2Score : this.gameState.player2Score;
		this.gameState.winningPlayer = data.winningPlayer;
		if (data.reason === VYW.Protocol.GameOverReason.End) {
			this.gameState.timeToEnd = 0;
		}
	};

	/**
	 * Draws the game
	 */
	SnakeEngine.prototype.draw = function() {
		// Important to clear the canvas first...
		this.graphics.clear();

		// Draw the game objects
		if (this.board) { this.board.draw(this.graphics); }
		if (this.snake1) { this.snake1.draw(this.graphics); }
		if (this.snake2) { this.snake2.draw(this.graphics); }
		if (this.gameState) { this.gameState.draw(this.graphics); }

		for (var i = 0; i < this.pellets.length; ++i) {
			this.pellets[i].draw(this.graphics);
		}

		// No need to reload the draw timer if we are disconnected or game over.
		if (this.gameState &&
			(this.gameState.state === VYW.GameState.GameState.Disconnected || this.gameState.state === VYW.GameState.GameState.GameOver)) {
			return;
		}

		// Let the browser call the draw method again when available
		win.requestAnimationFrame(this.draw.bind(this));
	};

	/**
	 * Handles a key down event
	 * @param {object} e - The event args
	 * @private
	 */
	SnakeEngine.prototype.handleKeyDown = function(e) {
		var newDir = '';
		// Get the new direction per key code
		switch (e.keyCode) {
			case VYW.KeyCodes.Left:
				newDir = VYW.Protocol.Direction.Left;
				break;
			case VYW.KeyCodes.Right:
				newDir = VYW.Protocol.Direction.Right;
				break;
			case VYW.KeyCodes.Up:
				newDir = VYW.Protocol.Direction.Up;
				break;
			case VYW.KeyCodes.Down:
				newDir = VYW.Protocol.Direction.Down;
				break;
		}

		if (!newDir) {
			return;
		}

		// Find the home snake (whose keyboard input we handle) current direction, if it is the same stop.
		var homeSnakeDir = this.gameState.playerIndex === 1 ? this.snake1.direction : this.snake2.direction;
		if (newDir === homeSnakeDir) {
			return;
		}

		// Make sure we can do the change (can't do 180 degrees turns)
		if (newDir === VYW.Protocol.Direction.Right && homeSnakeDir === VYW.Protocol.Direction.Left) {
			return;
		} else if (newDir === VYW.Protocol.Direction.Left && homeSnakeDir === VYW.Protocol.Direction.Right) {
			return;
		} else if (newDir === VYW.Protocol.Direction.Up && homeSnakeDir === VYW.Protocol.Direction.Down) {
			return;
		} else if (newDir === VYW.Protocol.Direction.Down && homeSnakeDir === VYW.Protocol.Direction.Up) {
			return;
		}

		// Build a message and send it
		var msg = VYW.Protocol.buildChangeDirection(this.gameState.playerIndex, newDir);
		this.connector.send(msg);
	};

	VYW.SnakeEngine = SnakeEngine;

}(window.VYW, window));
