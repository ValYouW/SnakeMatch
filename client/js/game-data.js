(function(VYW, win) {

	var TEXT_PAD_LEFT = 5;
	var STATUS_FONT_SIZE = 10;
	var STATUS_FONT = STATUS_FONT_SIZE + 'px sans-serif';
	var STATUS_SEP = ' / ';

	var MSG_FONT_SIZE = 20;
	var MSG_FONT = MSG_FONT_SIZE + 'px sans-serif';

	/**
	 *
	 * @param {GameSettings} settings
	 * @constructor
	 */
	function GameData(settings) {
		this.settings = settings;
		this.state = VYW.GameState.Disconnected;
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
	GameData.GameState = {
		Disconnected: 0,
		Connected: 1,
		Pending: 2,
		Ready: 3,
		Steady: 4,
		Running: 5,
		GameOver: 6
	};

	/**
	 *
	 * @param {Graphics} graphics
	 */
	GameData.prototype.draw = function(graphics) {
		// Always Draw the score
		this.drawStatusBar(graphics);

		var text;
		switch (this.state) {
			case GameData.GameState.Disconnected:
				text = 'DISCONNECTED';
				break;
			case GameData.GameState.Connected:
				text = 'CONNECTED';
				break;
			case GameData.GameState.Pending:
				text = 'WAITING FOR PLAYER2...';
				break;
			case GameData.GameState.Ready:
				text = 'READY...';
				break;
			case GameData.GameState.Steady:
				text = this.startIn;
				break;
			case GameData.GameState.GameOver:
				text = 'GAME OVER, ';
				if (this.winningPlayer === this.playerIndex) { text += 'YOU WON !!! :)' ;} else { text += 'YOU LOST :('; }
				break;
			default:
				return;
		}

		var x = Math.floor(graphics.canvas.width / 2);
		var y = Math.floor(graphics.canvas.height / 2);
		graphics.drawText(text, x, y, this.settings.textColor, MSG_FONT, VYW.Graphics.TextAlignment.Center);
	};

	GameData.prototype.drawStatusBar = function(graphics) {
		// The status bar looks like
		// "homeScore / awayScore / timeToEnd" - where the home/away scores are in the players colors

		var yourScore = (this.playerIndex === 1 ? this.player1Score : this.player2Score).toString();
		var awayScore = (this.player1Score + this.player2Score - yourScore).toString();
		graphics.drawText(yourScore, TEXT_PAD_LEFT, STATUS_FONT_SIZE, this.settings.homeSnakeColor, STATUS_FONT);

		// Draw the '/' separator after the home score, for that we need to know what the text width of the home score
		var s = graphics.measureText(yourScore, STATUS_FONT);
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

	VYW.GameData = GameData;

}(window.VYW, window));