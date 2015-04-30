window.VYW = window.VYW || {};
(function(VYW) {

	/**
	 * A game state enum
	 */
	VYW.GameState = {
		Paused: 0,
		Running: 1,
		End: 2
	};

	/**
	 * Keyboard key codes enum
	 */
	VYW.KeyCodes = {
		Pause: 32,
		Left: 37,
		Up: 38,
		Right: 39,
		Down: 40
	};

	/**
	 * The game settings class
	 * @param {object} settings - An object with initial game settings
	 * @constructor
	 */
	VYW.GameSettings = function(settings) {
		settings = typeof settings === 'object' && settings !== null ? settings : {};

		this.textColor = settings.textColor || '#000000';
		this.boardColor = settings.boardColor || '#ffffff';
		this.homeSnakeColor = settings.homeSnakeColor || '#00D45C';
		this.awaySnakeColor = settings.awaySnakeColor || '#E00040';
		this.pelletColor = settings.pelletColor || '#FF6A00';
	};

}(window.VYW));
