(function(parent, util, protocol, SnakePart) {

	/**
	 * The part of the snake that is the head
	 * @param {number} x - The SnakePart x location
	 * @param {number} y - The SnakePart y location
	 * @param {number} size - The SnakePart size
	 * @param {string} color - The SnakePart color
	 * @constructor
	 */
	function SnakeHead(x, y, size, color) {
		SnakePart.call(this, x, y, size, color);
		this.direction = null;
	}
	// Inherit from SnakePart
	util.inherits(SnakeHead, SnakePart);

	/**
	 * Updates the snake head
	 * @param {VYW.Direction} newDirection - A new direction for the snake
	 */
	SnakeHead.prototype.update = function(newDirection) {
		// Do the base update
		SnakePart.prototype.update.call(this);

		// Update location based on updated direction
		this.direction = newDirection;
		switch (this.direction) {
			case protocol.Direction.Right:
				this.location.x += this.size;
				break;
			case protocol.Direction.Left:
				this.location.x -= this.size;
				break;
			case protocol.Direction.Up:
				this.location.y -= this.size;
				break;
			case protocol.Direction.Down:
				this.location.y += this.size;
				break;
		}
	};

	parent.SnakeHead = SnakeHead;

// This file is shared between the client and the server, in case "window" is defined we assume it is the client
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('util') : window.VYW.Util,
  typeof window === 'undefined' ? require('../protocol.js').Protocol : window.VYW.Protocol,
  typeof window === 'undefined' ? require('./snake-part.js').SnakePart : window.VYW.SnakePart));
