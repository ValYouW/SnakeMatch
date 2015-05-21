/**
 * A node.js util for the client
 */
(function(VYW) {
	var Util = {};

	/**
	 * Inherit the prototype methods from one constructor into another.
	 * @param {function} ctor - Constructor function which needs to inherit the prototype.
	 * @param {function} superCtor - Constructor function to inherit prototype from.
	 */
	Util.inherits = function(ctor, superCtor) {
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

	VYW.Util = Util;

}(window.VYW));