var WebSocketServer = require('ws').Server,
	restify = require('restify'),
	path = require('path'),
	connMgr = require('./lobby.js');

// Create the server and listen on port 3000
var server = restify.createServer();
server.listen(3000, function () {
	console.log('Server listening at %s', server.url);
});

// Set the route for the static files
server.get(/\/public\/?.*/, restify.serveStatic({
	directory: path.resolve(__dirname, '../'),
	default: 'index.html'
}));

// Create the WebSocket server
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	connMgr.add(ws);
});