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

		this.board = null;
		this.snake1 = null;
		this.snake2 = null;
		this.pellets = [];
		this.gameData = new VYW.GameData(this.settings);

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

	SnakeEngine.prototype.handleConnectedMessage = function() {
		this.gameData.state = VYW.GameData.GameState.Connected;

		// Start the draw loop
		this.draw();
	};

	SnakeEngine.prototype.handleDisconnectMessage = function(reason) {
		// If GameOver we ignore the disconnect, it is ok as the server kick us on game over
		if (this.gameData.state !== VYW.GameData.GameState.GameOver) {
			this.gameData.state = VYW.GameData.GameState.Disconnected;
		}
	};

	SnakeEngine.prototype.handlePendingMatchMessage = function() {
		this.gameData.state = VYW.GameData.GameState.Pending;
	};

	/**
	 * Handles a ready message from the server
	 * @param {GetReadyMessage} data
	 */
	SnakeEngine.prototype.handleReadyMessage = function(data) {
		// Set some game data
		this.gameData.state = VYW.GameData.GameState.Ready;
		this.gameData.playerIndex = data.playerIndex;

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
		this.gameData.state = VYW.GameData.GameState.Steady;
		this.gameData.startIn = steadyMessage.timeToStart;
	};

	SnakeEngine.prototype.handleGameStartMessage = function() {
		this.gameData.startIn = 0;
		this.gameData.state = VYW.GameData.GameState.Running;
	};

	/**
	 *
	 * @param {UpdateMessage} data
	 */
	SnakeEngine.prototype.handleGameUpdateMessage = function(data) {
		this.gameData.player1Score = data.player1Score;
		this.gameData.player2Score = data.player2Score;
		this.gameData.timeToEnd = data.timeToEnd;

		this.snake1.direction = data.player1Direction;
		this.snake1.update();
		this.snake2.direction = data.player2Direction;
		this.snake2.update();
	};

	SnakeEngine.prototype.handleGameOverMessage = function(reason, winningPlayerIndex) {
		this.gameData.state = VYW.GameData.GameState.GameOver;
		this.gameData.winningPlayer = winningPlayerIndex;
	};

	/**
	 * Draws the game
	 */
	SnakeEngine.prototype.draw = function() {
		this.graphics.clear();
		if (this.board) { this.board.draw(this.graphics); }
		if (this.snake1) { this.snake1.draw(this.graphics); }
		if (this.snake2) { this.snake2.draw(this.graphics); }
		if (this.gameData) { this.gameData.draw(this.graphics); }

		// No need to reload the draw timer if we are disconnected or game over.
		if (this.gameData &&
			(this.gameData.state === VYW.GameData.GameState.Disconnected || this.gameData.state === VYW.GameData.GameState.GameOver)) {
			return;
		}

		win.requestAnimationFrame(this.draw.bind(this));

//		this.board.draw(this.graphics);
//		this.snake1.draw(this.graphics);
//		this.snake2.draw(this.graphics);
//
//		// Draw the pellets
//		for (var i = 0; i < this.pellets.length; ++i) {
//			this.pellets[i].draw(this.graphics);
//		}
	};

	/**
	 * Handles a key down event
	 * @param {object} e - The event args
	 * @private
	 */
	SnakeEngine.prototype.handleKeyDown = function(e) {
		switch (e.keyCode) {
			case VYW.KeyCodes.Left:
				this.direction = VYW.Direction.Left;
				break;
			case VYW.KeyCodes.Right:
				this.direction = VYW.Direction.Right;
				break;
			case VYW.KeyCodes.Up:
				this.direction = VYW.Direction.Up;
				break;
			case VYW.KeyCodes.Down:
				this.direction = VYW.Direction.Down;
				break;
		}
	};

	VYW.SnakeEngine = SnakeEngine;

}(window.VYW, window));
