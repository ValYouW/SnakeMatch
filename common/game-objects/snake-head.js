// This file is shared between the client and the server, in case "window" is defined we assume it is the client
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

		// Update the head direction according to the new direction, MAKE SURE we can do the change (can't do 180 degrees turns)
		if (newDirection === protocol.Direction.Right && this.direction !== protocol.Direction.Left) {
			this.direction = newDirection;
		} else if (newDirection === protocol.Direction.Left && this.direction !== protocol.Direction.Right) {
			this.direction = newDirection;
		} else if (newDirection === protocol.Direction.Up && this.direction !== protocol.Direction.Down) {
			this.direction = newDirection;
		} else if (newDirection === protocol.Direction.Down && this.direction !== protocol.Direction.Up) {
			this.direction = newDirection;
		}

		// Update location based on updated direction
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

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('util') : window.VYW.Util,
  typeof window === 'undefined' ? require('../protocol.js') : window.VYW.Protocol,
  typeof window === 'undefined' ? require('./snake-part.js').SnakePart : window.VYW.SnakePart));
