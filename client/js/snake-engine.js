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
		this.homeSnake = null;
		this.awaySnake = null;
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
	 * @param {GetReadyMessage} readyMessage
	 */
	SnakeEngine.prototype.handleReadyMessage = function(readyMessage) {
		this.gameData.state = VYW.GameData.GameState.Ready;
		this.gameData.playerIndex = readyMessage.playerIndex;
		this.board = new VYW.Board(readyMessage.boardWidth, readyMessage.boardHeight, readyMessage.boardCellSize, this.settings.boardColor);
		this.canvas.width = readyMessage.boardWidth;
		this.canvas.height = readyMessage.boardHeight;
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
	};

	SnakeEngine.prototype.handleGameOverMessage = function(reason, winningPlayerIndex) {

	};




	// todo: Subscribe to connector events.
	// Ready: set the canvas size and create the board object and snakes
	// Steady: print to screen the steady
	// Go: subscribe to keyboard events
	// Update: update the snakes locations property and draw all

	/**
	 * Draws the game
	 */
	SnakeEngine.prototype.draw = function() {
		// First clear canvas
		this.graphics.clear();

		this.gameData.draw(this.graphics);
		win.requestAnimationFrame(this.draw.bind(this));

//		this.board.draw(this.graphics);
//		this.homeSnake.draw(this.graphics);
//		this.awaySnake.draw(this.graphics);
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
