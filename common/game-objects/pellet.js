// This file is shared between the client and the server, in case "window" is defined we assume it is the client
(function(parent) {

	/**
	 * Creates a new Pellet instance
	 * @param {Rectangle} loc - The pellet location
	 * @param {string} color - The pellet color
	 * @constructor
	 */
	function Pellet(loc, color) {
		this.location = loc;
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
}(typeof window === 'undefined' ? module.exports : window.VYW));