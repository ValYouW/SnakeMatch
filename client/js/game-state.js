/**
 * This class will hold and draw info about the game state
 */
(function(VYW) {
	// Hold some constants to draw the status bar (players scores)
	var TEXT_PAD_LEFT = 5;
	var STATUS_FONT_SIZE = 10;
	var STATUS_FONT = STATUS_FONT_SIZE + 'px sans-serif';
	var STATUS_SEP = ' / ';

	var MSG_FONT_SIZE = 20;
	var MSG_FONT = MSG_FONT_SIZE + 'px sans-serif';

	/**
	 * Creates a new instance of GameState
	 * @param {GameSettings} settings - The game settings object
	 * @constructor
	 */
	function GameState(settings) {
		this.settings = settings;
		this.state = GameState.Disconnected;
		this.playerIndex = -1;
		this.startIn = -1;
		this.timeToEnd = -1;
		this.player1Score = 0;
		this.player2Score = 0;
		this.winningPlayer = -1;
	}

	/**
	 * Game state enum
	 */
	GameState.GameState = {
		Disconnected: 0,
		Connected: 1,
		Pending: 2,
		Ready: 3,
		Steady: 4,
		Running: 5,
		GameOver: 6
	};

	/**
	 * Draw the game state as status bar on the canvas
	 * @param {Graphics} graphics - The graphics object to draw
	 */
	GameState.prototype.draw = function(graphics) {
		// Always Draw the score
		this.drawStatusBar(graphics);

		// Create a text message according to the state
		var text;
		switch (this.state) {
			case GameState.GameState.Disconnected:
				text = 'DISCONNECTED';
				break;
			case GameState.GameState.Connected:
				text = 'CONNECTED';
				break;
			case GameState.GameState.Pending:
				text = 'WAITING FOR PLAYER2...';
				break;
			case GameState.GameState.Ready:
				text = 'READY...';
				break;
			case GameState.GameState.Steady:
				text = this.startIn;
				break;
			case GameState.GameState.GameOver:
				text = 'GAME OVER, ';
				if (this.winningPlayer === this.playerIndex) { text += 'YOU WON !!! :)' ;} else { text += 'YOU LOST :('; }
				break;
			default:
				return;
		}

		// Draw the state in the middle of the canvas
		var x = Math.floor(graphics.canvas.width / 2);
		var y = Math.floor(graphics.canvas.height / 2);
		graphics.drawText(text, x, y, this.settings.textColor, MSG_FONT, VYW.Graphics.TextAlignment.Center);
	};

	/**
	 * Draw the status bar
	 * @param {Graphics} graphics - The graphics object to draw
	 */
	GameState.prototype.drawStatusBar = function(graphics) {
		// The status bar looks like
		// "homeScore / awayScore / timeToEnd" - where the home/away scores are in the players colors

		// Calc the home/away scores
		var homeScore = (this.playerIndex === 1 ? this.player1Score : this.player2Score).toString();
		var awayScore = (this.player1Score + this.player2Score - homeScore).toString();

		// Draw the home score first
		graphics.drawText(homeScore, TEXT_PAD_LEFT, STATUS_FONT_SIZE, this.settings.homeSnakeColor, STATUS_FONT);

		// Draw the '/' separator after the home score, for that we need to know what the text width of the home score
		var s = graphics.measureText(homeScore, STATUS_FONT);
		graphics.drawText(STATUS_SEP, TEXT_PAD_LEFT + s, STATUS_FONT_SIZE, this.settings.textColor, STATUS_FONT);

		// Draw the away score
		s += graphics.measureText(STATUS_SEP, STATUS_FONT);
		graphics.drawText(awayScore, TEXT_PAD_LEFT + s, STATUS_FONT_SIZE, this.settings.awaySnakeColor, STATUS_FONT);

		// Draw the time to end
		if (this.timeToEnd >= 0) {
			// Draw the '/' separator after the "home / away" score, for that we need to know what the text width of the "home / away" score
			s += graphics.measureText(awayScore, STATUS_FONT);
			graphics.drawText(STATUS_SEP, TEXT_PAD_LEFT + s, STATUS_FONT_SIZE, this.settings.textColor, STATUS_FONT);

			s += graphics.measureText(STATUS_SEP, STATUS_FONT);
			graphics.drawText((this.timeToEnd/1000).toFixed(2), TEXT_PAD_LEFT + s, STATUS_FONT_SIZE, this.settings.textColor, STATUS_FONT);
		}
	};

	VYW.GameState = GameState;

}(window.VYW));