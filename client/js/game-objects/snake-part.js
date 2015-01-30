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

	/**
	 * This is an abstract class that have the common snake part (link) features
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

	VYW.SnakePart = SnakePart;

}(window.VYW));