window.VYW = window.VYW || {};
(function(VYW) {

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

	/**
	 * Creates a new Graphics instance
	 * @param {object} canvas - An HTML Canvas element
	 * @constructor
	 */
	function Graphics(canvas) {
		if (!canvas || canvas.nodeName.toLowerCase() !== 'canvas') {
			throw new Error('canvas is mandatory and must be a canvas element');
		}

		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
	}

	/**
	 * Clears the drawing canvas
	 */
	Graphics.prototype.clear = function() {
		this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
	};

	/**
	 * Draws a rectangle filled with color
	 * @param {Rectangle} rect - The rectangle to fill
	 * @param {string} [color='#000000'] - The rectangle color
	 */
	Graphics.prototype.fillRectangle = function(rect, color) {
		this.context.beginPath();
		this.context.rect(rect.x, rect.y, rect.width, rect.height);
		this.context.fillStyle = color || '#000000';
		this.context.fill();
	};

	VYW.Graphics = Graphics;
	VYW.Rectangle = Rectangle;

}(window.VYW));