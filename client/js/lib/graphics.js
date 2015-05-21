/**
 * This class is used for drawing on a Canvas
 */
(function(VYW) {

	var DEFAULT_COLOR = '#000000';

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

	Graphics.TextAlignment = {
		Right: 'right',
		Center: 'center',
		Left: 'left'
	};

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
		this.context.fillStyle = color || DEFAULT_COLOR;
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
		this.context.strokeStyle = color || DEFAULT_COLOR;
		this.context.stroke();
	};

	/**
	 * Draws a text on the canvas
	 * @param {string} text - The text to draw
	 * @param {number} x - The x pixel where to start drawing
	 * @param {number} y - The y pixel where the bottom of the text would be
	 * @param {string} color - The text color
	 * @param {string} font - The text font
	 * @param {Graphics.TextAlignment} [align] - The text horizontal alignment
	 */
	Graphics.prototype.drawText = function(text, x, y, color, font, align) {
		if (typeof font !== 'undefined') {this.context.font = font;}
		if (typeof color !== 'undefined') {this.context.fillStyle = color;} else {this.context.fillStyle = DEFAULT_COLOR;}
		if (typeof align !== 'undefined') {this.context.textAlign = align;} else {this.context.textAlign = Graphics.TextAlignment.Left;}

		this.context.fillText(text, x, y);
	};

	/**
	 * Measure the width of a text with a given font
	 * @param {string} str - The string to measure
	 * @param {string} font - The font to measure with
	 * @returns {Number}
	 */
	Graphics.prototype.measureText = function(str, font) {
		// Save the current font, we want to replace the context font only for the measure
		var oldFont = this.context.font;
		if (font) {
			this.context.font = font;
		}

		var res = this.context.measureText(str).width;
		this.context.font = oldFont;
		return res;
	};

	// Export Graphics
	VYW.Graphics = Graphics;

}(window.VYW));