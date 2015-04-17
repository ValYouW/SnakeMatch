var Board = require('../../common/game-objects/board.js').Board,
	Snake = require('../../common/game-objects/snake.js').Snake,
	Pellet = require('../../common/game-objects/pellet.js').Pellet,
	protocol = require('../../common/protocol.js');

var INITIAL_SNAKE_SIZE = 6;
var MAX_PELLETS = 6;

function SnakeEngine(width, height, cellSize) {
	this.board = new Board(width, height, cellSize);

	// The first snake is created on the left side and is heading right (very top row, y index = 0)
	var snakeLoc = this.board.toScreen(INITIAL_SNAKE_SIZE - 1);
	this.snake1 = new Snake(snakeLoc.x, snakeLoc.y, cellSize, INITIAL_SNAKE_SIZE, protocol.Direction.Right);

	// The second snake is created on the right side and is heading left (very top row, y index = 0)
	snakeLoc = this.board.toScreen(width/cellSize - INITIAL_SNAKE_SIZE);
	this.snake2 = new Snake(snakeLoc.x, snakeLoc.y, cellSize, INITIAL_SNAKE_SIZE, protocol.Direction.Left);

	this.pellets = [];
}

/**
 * Updates the game, if either snake has lost due to collision, return its index
 * @returns {Number} The index of the LOOSING snake
 */
SnakeEngine.prototype.update = function() {
	// Update snake1
	this.snake1.update();

	// Check if the snake collides with itself or out-of-bounds
	var collision = this.checkCollision(this.snake1);
	if (collision) {
		return 1;
	}

	// Check if the snake eats a pellet
	this.eatPellet(this.snake1);

	// Update snake2
	this.snake2.update();

	// Check if the snake collides with itself or out-of-bounds
	collision = this.checkCollision(this.snake2);
	if (collision) {
		return 2;
	}

	// Check if the snake eats a pellet
	this.eatPellet(this.snake2);

	// Finally add new pellet
	this.addPellet();

	// No one lost (yet...).
	return -1;
};

/**
 * Checks if the snake collides with itself ot out-of-bounds
 * @returns {boolean} Whether there was a collision
 * @private
 */
SnakeEngine.prototype.checkCollision = function(snake) {
	// Check if the head is out-of-bounds
	if (snake.parts[0].location.x < 0 ||
		snake.parts[0].location.y < 0 ||
		snake.parts[0].location.x + snake.parts[0].size > this.board.rectangle.width ||
		snake.parts[0].location.y + snake.parts[0].size > this.board.rectangle.height) {

		return true;
	}

	// Check if the snake head collides with its body
	for (var i = 1; i < snake.parts.length; ++i) {
		if (snake.parts[0].location.equals(snake.parts[i].location)) {
			return true;
		}
	}

	return false;
};

/**
 * Check if the snake eats a pellet, add new ones if necessary
 * @param {Snake} snake - The snake that should eat
 * @private
 */
SnakeEngine.prototype.eatPellet = function(snake) {
	// Check if the snake head collides with pellet
	for (var i = 0; i < this.pellets.length; ++i) {
		if (snake.parts[0].location.equals(this.pellets[i].location)) {
			// Add tail to the snake
			snake.addTail();

			// Remove this pellet
			this.pellets.splice(i, 1);
			break;
		}
	}
};

/**
 * Adds a new pellet to the game
 * @private
 */
SnakeEngine.prototype.addPellet = function() {
	// Check if we should add pellets
	if (this.pellets.length >= MAX_PELLETS || Math.random() > 0.2) {
		return;
	}

	// Keep loop until we found a spot for a pellet (theoretically this can turn into an infinite loop, so a solution could
	// be to stop the random search after X times and look for a spot on the board).
	var keepSearch = true;
	while (keepSearch) {
		keepSearch = false;

		// Take a random spot on the board
		var boxIndex = Math.floor(Math.random() * this.board.horizontalBoxes * this.board.horizontalBoxes);
		var loc = this.board.toScreen(boxIndex);

		// check that this spot is not on snake1
		for (var i = 0; i < this.snake1.parts.length; ++i) {
			if (this.snake1.parts[i].location.equals(loc)) {
				keepSearch = true;
				break;
			}
		}

		if (!keepSearch) {
			// check that this spot is not on snake2
			for (i = 0; i < this.snake2.parts.length; ++i) {
				if (this.snake2.parts[i].location.equals(loc)) {
					keepSearch = true;
					break;
				}
			}
		}

		if (!keepSearch) {
			// Hooray we can add the pellet
			this.pellets.push(new Pellet(loc.x, loc.y, loc.width));
		}
	}
};


module.exports = SnakeEngine;