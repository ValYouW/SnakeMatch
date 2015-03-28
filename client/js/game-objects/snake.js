window.VYW = window.VYW || {};
(function(VYW) {

	function Snake(startX, startY, size, length, color) {
		this.parts = [];

		// Create the head
		var part = new VYW.SnakeHead(startX, startY, size, color);
		this.parts.push(part);

		// Create the rest of the snake body
		for (var i = 0; i < length - 1; ++i) {
			startX -= size;
			part = new VYW.SnakePart(startX, startY, size, color, this.parts[this.parts.length-1]);
			this.parts.push(part);
		}
	}

	/**
	 * Adds a new tail to the snake
	 */
	Snake.prototype.addTail = function() {
		var currTail = this.parts[this.parts.length-1];
		var newSnakeTail = new VYW.SnakePart(currTail.prevLocation.x, currTail.prevLocation.y, currTail.size, currTail.color, currTail);
		this.parts.push(newSnakeTail);
	};

	/**
	 * Updates the snake head
	 * @param {VYW.Direction} newDirection - A new direction for the snake
	 */
	Snake.prototype.update = function(newDirection) {
		// Update the head first
		this.parts[0].update(newDirection);

		// Update the rest of the snake
		for (var i = 1; i < this.parts.length; ++i) {
			this.parts[i].update();
		}
	};

	/**
	 * Draw the snake
	 * @param {VYW.Graphics} graphics - The Graphics object
	 */
	Snake.prototype.draw = function(graphics) {
		for (var i = 0; i < this.parts.length; ++i) {
			this.parts[i].draw(graphics);
		}
	};

	VYW.Snake = Snake;

}(window.VYW));