// This file is shared between the client and the server, in case "window" is defined we assume it is the client
(function(parent, protocol, SnakeHead, SnakePart) {

	/**
	 * Creates a new snake
	 * @param {number} startX - The snake head X
	 * @param {number} startY - The snake head Y
	 * @param {number} partSize - The size of a single snake part
	 * @param {number} length - The total number of parts of the snake
	 * @param {Direction} direction - The direction of the snake
	 * @param color
	 * @constructor
	 */
	function Snake(startX, startY, partSize, length, direction, color) {
		/* @type {SnakePart[]} */
		this.parts = [];

		// Create the head
		var part = new SnakeHead(startX, startY, partSize, color);
		this.parts.push(part);

		// grow will be used in order to create the snake parts in the correct direction
		var grow;
		if (direction === protocol.Direction.Right) {
			grow = -1;
		} else if (direction === protocol.Direction.Left) {
			grow = 1;
		} else {
			throw new Error('Invalid initial direction, only Right/Left is allowed');
		}

		this.direction = direction;

		// Create the rest of the snake body
		for (var i = 0; i < length - 1; ++i) {
			startX += (grow * partSize);
			part = new SnakePart(startX, startY, partSize, color, this.parts[this.parts.length-1]);
			this.parts.push(part);
		}
	}

	Object.defineProperty(Snake.prototype, 'color', {
		set: function(color) {
			for (var i = 0; i < this.parts.length; ++i) {
				this.parts[i].color = color;
			}
		}
	});

	/**
	 * Adds a new tail to the snake
	 */
	Snake.prototype.addTail = function() {
		var currTail = this.parts[this.parts.length-1];
		var newSnakeTail = new SnakePart(currTail.prevLocation.x, currTail.prevLocation.y, currTail.size, currTail.color, currTail);
		this.parts.push(newSnakeTail);
	};

	/**
	 * Updates the snake
	 */
	Snake.prototype.update = function() {
		// Update the head first
		this.parts[0].update(this.direction);

		// Update the rest of the snake
		for (var i = 1; i < this.parts.length; ++i) {
			this.parts[i].update();
		}
	};

	/**
	 * Draw the snake
	 * @param {Graphics} graphics - The Graphics object
	 */
	Snake.prototype.draw = function(graphics) {
		for (var i = 0; i < this.parts.length; ++i) {
			this.parts[i].draw(graphics);
		}
	};

	parent.Snake = Snake;

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('../protocol.js') : window.VYW.Protocol,
  typeof window === 'undefined' ? require('./snake-head.js').SnakeHead : window.VYW.SnakeHead,
  typeof window === 'undefined' ? require('./snake-part.js').SnakePart : window.VYW.SnakePart));
