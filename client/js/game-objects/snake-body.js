window.VYW = window.VYW || {};
(function(VYW) {

	/**
	 * Part of the snake that is not the head
	 * @param {number} x - The SnakePart x location
	 * @param {number} y - The SnakePart y location
	 * @param {number} size - The SnakePart size
	 * @param {string} color - The SnakePart color
	 * @param {SnakePart} following - The SnakePart this body link is following
	 * @constructor
	 */
	function SnakeBody(x, y, size, color, following) {
		VYW.SnakePart.call(this, x, y, size, color);
		this.following = following;

		if (!(this.following instanceof VYW.SnakePart)) {
			throw new Error('SnakeBody must be following someone...');
		}
	}
	// Inherit from SnakePart
	VYW.inherits(SnakeBody, VYW.SnakePart);

	SnakeBody.prototype.update = function() {
		// Do the base update
		VYW.SnakePart.prototype.update.call(this);

		// We are just followers here...
		this.location = this.following.prevLocation;
	};

	VYW.SnakeBody = SnakeBody;

}(window.VYW));