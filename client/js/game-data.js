(function(VYW, win) {

	var TEXT_PAD_LEFT = 5;
	var SCORE_FONT_SIZE = 10;
	var SCORE_FONT = SCORE_FONT_SIZE + 'px sans-serif';
	var SCORE_SEP = ' / ';

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
		this.player1Score = 0;
		this.player2Score = 0;
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
		this.drawScore(graphics);

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
				text = 'GAME OVER';
				break;
			default:
				return;
		}

		var x = Math.floor(graphics.canvas.width / 2);
		var y = Math.floor(graphics.canvas.height / 2);
		graphics.drawText(text, x, y, this.settings.textColor, MSG_FONT, VYW.Graphics.TextAlignment.Center);
	};

	GameData.prototype.drawScore = function(graphics) {
		var yourScore = (this.playerIndex === 1 ? this.player1Score : this.player2Score).toString();
		var awayScore = (this.player1Score + this.player2Score - yourScore).toString();
		graphics.drawText(yourScore, TEXT_PAD_LEFT, SCORE_FONT_SIZE, this.settings.homeSnakeColor, SCORE_FONT);

		// Draw the '/' separator after the home score, for that we need to know what the text width of the home score
		var s = graphics.measureText(yourScore, SCORE_FONT);
		graphics.drawText(SCORE_SEP, TEXT_PAD_LEFT + s, SCORE_FONT_SIZE, this.settings.textColor, SCORE_FONT);

		// Draw the away score
		s += graphics.measureText(SCORE_SEP, SCORE_FONT);
		graphics.drawText(awayScore, TEXT_PAD_LEFT + s, SCORE_FONT_SIZE, this.settings.awaySnakeColor, SCORE_FONT);
	};

	VYW.GameData = GameData;

}(window.VYW, window));