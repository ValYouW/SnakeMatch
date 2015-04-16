window.VYW = window.VYW || {};
(function(VYW) {
	/**
	 * Define some enums and common classes/utils
	 */

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
	 * Snake direction enum
	 */
	VYW.Direction = {
		Left: 0,
		Up: 1,
		Right: 2,
		Down: 3
	};

	/**
	 * The game settings class
	 * @param {object} settings - An object with initial game settings
	 * @constructor
	 */
	VYW.GameSettings = function(settings) {
		settings = typeof settings === 'object' && settings !== null ? settings : {};

		this.boardColor = settings.boardColor || '#ffffff';
		this.homeSnakeColor = settings.homeSnakeColor || '#00D45C';
		this.awaySnakeColor = settings.awaySnakeColor || '#E00040';
		this.pelletColor = settings.pelletColor || '#FF6A00';
	};

	/**
	 * Inherit the prototype methods from one constructor into another.
	 * @param {function} ctor - Constructor function which needs to inherit the prototype.
	 * @param {function} superCtor - Constructor function to inherit prototype from.
	 */
	VYW.inherits = function(ctor, superCtor) {
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

}(window.VYW));
