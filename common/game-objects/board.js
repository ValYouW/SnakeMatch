// This file is shared between the client and the server, in case "window" is defined we assume it is the client
(function(parent, Rectangle) {

	/**
	 * Creates a new game board instance
	 * @param {number} w - The board width
	 * @param {number} h - The board height
	 * @param {string} color - The board color
	 * @param {string} borderColor - The board border color
	 * @constructor
	 */
	function Board(w, h, color, borderColor) {
		this.rectangle = new Rectangle(0, 0, w, h);
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

	parent.Board = Board;

// Pass in the correct object (server vs client)
}(typeof window === 'undefined' ? module.exports : window.VYW,
  typeof window === 'undefined' ? require('../rectangle.js').Rectangle : window.VYW.Rectangle));
