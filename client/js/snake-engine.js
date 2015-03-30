window.VYW = window.VYW || {};
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

		this.board = new VYW.Board(this.canvas.width, this.canvas.height, this.settings.boardColor);
		this.homeSnake = null;
		this.awaySnake = null;
		this.pellets = [];

		// Bind to the window key-down event
		win.onkeydown = this.handleKeyDown.bind(this);
	}

	// todo: Subscribe to connector events.
	// Ready: set the canvas size and create the board object and snakes
	// Steady: print to screen the steady
	// Go: subscribe to keyboard events
	// Update: update the snakes locations property and draw all

	/**
	 * Draws the game
	 */
	SnakeEngine.prototype.draw = function() {
		this.board.draw(this.graphics);
		this.homeSnake.draw(this.graphics);
		this.awaySnake.draw(this.graphics);

		// Draw the pellets
		for (var i = 0; i < this.pellets.length; ++i) {
			this.pellets[i].draw(this.graphics);
		}
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