// This file is shared between the client and the server, in case "window" is defined we assume it is the client
(function(parent, Rectangle) {

	/**
	 * This is a common snake part
	 * @param {number} x - The SnakePart x location
	 * @param {number} y - The SnakePart y location
	 * @param {number} size - The SnakePart size
	 * @param {string} color - The SnakePart color
	 * @param {SnakePart} [following=null] - The SnakePart this body link is following (if any)
	 */
	function SnakePart(x, y, size, color, following) {
		following = following || null;
		this.location = new Rectangle(x, y, size, size);
		this.size = size;
		this.color = color;
		this.prevLocation = null;

		this.following = following;
		if (this.following && !(this.following instanceof SnakePart)) {
			throw new Error('SnakeBody must be following someone...');
		}
	}

	/**
	 * Draws the snake part onto graphics
	 * @param {Graphics} graphics - The game graphics
	 */
	SnakePart.prototype.draw = function(graphics) {
		graphics.fillRectangle(this.location,  this.color);
	};

	/**
	 * Updates the snake state
	 */
	SnakePart.prototype.update = function() {
		// Save the current location as previous
		this.prevLocation = this.location.clone();

		// We are just followers here...
		if (this.following !== null) {
			this.location = this.following.prevLocation;
		}
	};

	parent.SnakePart = SnakePart;

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('../rectangle.js').Rectangle : window.VYW.Rectangle));
