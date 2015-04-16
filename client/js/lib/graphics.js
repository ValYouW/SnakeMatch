(function(VYW) {

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

	/**
	 * Draws a rectangle
	 * @param {Rectangle} rect - The rectangle to fill
	 * @param {string} [color='#000000'] - The rectangle color
	 */
	Graphics.prototype.drawRectangle = function(rect, color) {
		this.context.beginPath();
		this.context.rect(rect.x, rect.y, rect.width, rect.height);
		this.context.strokeStyle = color || '#000000';
		this.context.stroke();
	};

	VYW.Graphics = Graphics;

}(window.VYW));