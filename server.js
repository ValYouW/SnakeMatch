var WebSocketServer = require('ws').Server,
	restify = require('restify');

// Create the server and listen on port 3000
var server = restify.createServer();
server.listen(3000, function () {
	console.log('Server listening at %s', server.url);
});

// Set the route for the static files
server.get('/public', restify.serveStSatic({
	directory: __dirname,
	default: 'index.html'
}));

// Create the WebSocket server
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	var id = setInterval(function() {
		ws.send(JSON.stringify(new Date()));
	}, 1000);

	console.log('websocket connection open');

	ws.on('close', function() {
		console.log('websocket connection close');
		clearInterval(id);
	});
});