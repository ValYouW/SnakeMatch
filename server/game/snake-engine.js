var Board = require('../../common/game-objects/board.js').Board,
	Snake = require('../../common/game-objects/snake.js').Snake,
	Pellet = require('../../common/game-objects/pellet.js').Pellet,
	protocol = require('../../common/protocol.js').Protocol;

var INITIAL_SNAKE_SIZE = 5;
var MAX_PELLETS = 6;

/**
 * Represents a game update response
 * @constructor
 */
function UpdateResponse() {
	this.loosingSnake = -1;
	this.pelletsUpdate = false;
}

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
 * Handles a message from the client signaling a direction change
 * @param {ChangeDirMessage} data
 */
SnakeEngine.prototype.handleDirChangeMessage = function(data) {
	if (data.playerIndex === 1) {
		this.snake1.changeDirection(data.newDirection);
	} else if (data.playerIndex === 2) {
		this.snake2.changeDirection(data.newDirection);
	}
};

/**
 * Updates the game, if either snake has lost due to collision, return its index
 * @returns {UpdateResponse} The index of the LOOSING snake
 */
SnakeEngine.prototype.update = function() {
	var res = new UpdateResponse();

	// Update snake1
	this.snake1.update();

	// Check if the snake collides with itself or out-of-bounds
	var collision = this.checkCollision(this.snake1);
	if (collision) {
		res.loosingSnake = 1;
		return res;
	}

	// Check if the snake eats a pellet
	res.pelletsUpdate = this.eatPellet(this.snake1);

	// Update snake2
	this.snake2.update();

	// Check if the snake collides with itself or out-of-bounds
	collision = this.checkCollision(this.snake2);
	if (collision) {
		res.loosingSnake = 2;
		return res;
	}

	// Check if the snake eats a pellet
	res.pelletsUpdate = this.eatPellet(this.snake2) || res.pelletsUpdate;

	// Finally add new pellet
	res.pelletsUpdate = this.addPellet() || res.pelletsUpdate;

	// No one lost (yet...).
	return res;
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
 * @returns {boolean} Whether the snake ate a pellet
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
			return true;
		}
	}

	return false;
};

/**
 * Adds a new pellet to the game
 * @returns {boolean} Whether a new pellet added
 * @private
 */
SnakeEngine.prototype.addPellet = function() {
	// Check if we should add pellets
	if (this.pellets.length >= MAX_PELLETS || Math.random() > 0.2) {
		return false;
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
			this.pellets.push(new Pellet(loc));
		}
	}

	return true;
};

module.exports = SnakeEngine;