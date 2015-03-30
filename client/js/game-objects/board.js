window.VYW = window.VYW || {};
(function(VYW) {

	/**
	 * Creates a new game board instance
	 * @param {number} w - The board width
	 * @param {number} h - The board height
	 * @param {string} color - The board color
	 * @param {string} borderColor - The board border color
	 * @constructor
	 */
	function Board(w, h, color, borderColor) {
		this.rectangle = new VYW.Rectangle(0, 0, w, h);
		this.color = color;
		this.borderColor = borderColor || '#000000';
	}

	/**
	 * Draws the board
	 * @param {Graphics} graphics - The game graphics
	 */
	Board.prototype.draw = function(graphics) {
		graphics.clear();
		graphics.fillRectangle(this.rectangle,  this.color);
		graphics.drawRectangle(this.rectangle, this.borderColor);
	};

	VYW.Board = Board;

}(window.VYW));
