// This file is shared between the client and the server, in case "window" is defined we assume it is the client
(function(parent, Rectangle) {

	/**
	 * Creates a new Pellet instance
	 * @param {number} x - The pellet x location
	 * @param {number} y - The pellet y location
	 * @param {number} size - The pellet size
	 * @param {string} color - The pellet color
	 * @constructor
	 */
	function Pellet(x, y, size, color) {
		this.location = new Rectangle(x, y, size, size);
		this.size = size;
		this.color = color;
	}

	/**
	 * The Pellet update method
	 */
	Pellet.prototype.update = function() {
		// Nothing now, but maybe can switch colors or whatever....
	};

	/**
	 * Draws the Pellet
	 * @param {Graphics} graphics - The game graphics
	 */
	Pellet.prototype.draw = function(graphics) {
		graphics.fillRectangle(this.location,  this.color);
	};

	parent.Pellet = Pellet;

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('../rectangle.js').Rectangle : window.VYW.Rectangle));

