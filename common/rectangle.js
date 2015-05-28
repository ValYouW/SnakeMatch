(function(parent) {

	/**
	 * Creates a new Rectangle instance
	 * @param {number} x - Upper left corner x
	 * @param {number} y - Upper left corner y
	 * @param {number} width - The rectangle width
	 * @param {number} height - The rectangle height
	 * @constructor
	 */
	function Rectangle(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	/**
	 * Clones the rectangle
	 * @returns {Rectangle}
	 */
	Rectangle.prototype.clone = function() {
		return new Rectangle(this.x,  this.y, this.width, this.height);
	};

	/**
	 * Check if the dst Rectangle equals to this rectangle
	 * @param {Rectangle} dst - The Rectangle to compare to
	 * @returns {boolean}
	 */
	Rectangle.prototype.equals = function(dst) {
		return this.x === dst.x && this.y === dst.y && this.width === dst.width && this.height === dst.height;
	};

	parent.Rectangle = Rectangle;

// This file is shared between the client and the server, in case "window" is defined we assume it is the client
}(typeof window === 'undefined' ? module.exports : window.VYW));
