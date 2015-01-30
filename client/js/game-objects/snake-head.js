window.VYW = window.VYW || {};
(function(VYW) {

	/**
	 * The part of the snake that is the head
	 * @param {number} x - The SnakePart x location
	 * @param {number} y - The SnakePart y location
	 * @param {number} size - The SnakePart size
	 * @param {string} color - The SnakePart color
	 * @constructor
	 */
	function SnakeHead(x, y, size, color) {
		VYW.SnakePart.call(this, x, y, size, color);
		this.direction = null;
	}
	// Inherit from SnakePart
	VYW.inherits(SnakeHead, VYW.SnakePart);

	SnakeHead.prototype.update = function(newDirection) {
		// Do the base update
		VYW.SnakePart.prototype.update.call(this);

		// Update the head direction according to the new direction, MAKE SURE we can do the change (can't do 180 degrees turns)
		if (newDirection === VYW.Direction.Right && this.direction !== VYW.Direction.Left) {
			this.direction = newDirection;
		} else if (newDirection === VYW.Direction.Left && this.direction !== VYW.Direction.Right) {
			this.direction = newDirection;
		} else if (newDirection === VYW.Direction.Up && this.direction !== VYW.Direction.Down) {
			this.direction = newDirection;
		} else if (newDirection === VYW.Direction.Down && this.direction !== VYW.Direction.Up) {
			this.direction = newDirection;
		}

		// Update location based on updated direction
		switch (this.direction) {
			case VYW.Direction.Right:
				this.location.x += this.size;
				break;
			case VYW.Direction.Left:
				this.location.x -= this.size;
				break;
			case VYW.Direction.Up:
				this.location.y -= this.size;
				break;
			case VYW.Direction.Down:
				this.location.y += this.size;
				break;
		}
	};

	VYW.SnakeHead = SnakeHead;

}(window.VYW));