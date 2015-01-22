window.VYW = window.VYW || {};
(function(VYW) {

	/*
	* This file contains 3 classes that represents the snake.
	* 1) SnakePart - This is an abstract class that have the common snake part (link) feature
	* 2) SnakeBody - Part of the snake that is not the head
	* 3) SnakeHead - The part of the snake that is the head
	*
	* I did this because a SnakeBody and a SnakeHead have a slightly different behavior (different update method)
	*/

	/* ---- SnakePart -----*/

	/**
	 * Creates a new SnakePart instance
	 * @param {number} x - The SnakePart x location
	 * @param {number} y - The SnakePart y location
	 * @param {number} size - The SnakePart size
	 * @param {string} color - The SnakePart color
	 * @abstract
	 */
	function SnakePart(x, y, size, color) {
		this.location = new VYW.Rectangle(x, y, size, size);
		this.size = size;
		this.color = color;
		this.prevLocation = null;
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
	};

	/* ---- END SnakePart -----*/


	/* ---- SnakeBody -----*/

	function SnakeBody(x, y, size, color, following) {
		SnakePart.call(this, x, y, size, color);
		this.following = following;

		if (!(this.following instanceof SnakePart)) {
			throw new Error('SnakeBody must be following someone...');
		}
	}
	// Inherit from SnakePart
	VYW.inherits(SnakeBody, SnakePart);

	SnakeBody.prototype.update = function() {
		// Do the base update
		SnakePart.prototype.update.call(this);

		// We are just followers here...
		this.location = this.following.prevLocation;
	};

	/* ---- END SnakeBody -----*/

	/* ---- SnakeHead -----*/

	function SnakeHead(x, y, size, color) {
		SnakePart.call(this, x, y, size, color);
		this.direction = null;
	}
	// Inherit from SnakePart
	VYW.inherits(SnakeHead, SnakePart);

	SnakeHead.prototype.update = function(newDirection) {
		// Do the base update
		SnakePart.prototype.update.call(this);

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

	/* ---- END SnakeHead -----*/

	// Expose the classes
	VYW.SnakeBody = SnakeBody;
	VYW.SnakeHead = SnakeHead;

}(window.VYW));