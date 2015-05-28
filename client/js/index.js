/**
 * The main js file, should be included first.
 * Defines our namespace (VYW) and some common classes
 */
window.VYW = window.VYW || {};
(function(VYW) {

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
