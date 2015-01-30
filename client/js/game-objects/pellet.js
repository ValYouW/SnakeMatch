window.VYW = window.VYW || {};
(function(VYW) {

	/**
	 * Creates a new Pellet instance
	 * @param {number} x - The pellet x location
	 * @param {number} y - The pellet y location
	 * @param {number} size - The pellet size
	 * @param {string} color - The pellet color
	 * @constructor
	 */
	function Pellet(x, y, size, color) {
		this.location = new VYW.Rectangle(x, y, size, size);
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

	VYW.Pellet = Pellet;

}(window.VYW));
