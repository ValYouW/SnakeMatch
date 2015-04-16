var WebSocketServer = require('ws').Server,
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	connMgr = require('./lobby.js');

var directory = path.resolve(__dirname, '../client/deploy');

var server = http.createServer(function(req, res) {
	// This is a simple server, support only GET methods
	if (req.method !== 'GET') {
		res.writeHead(404);
		res.end();
		return;
	}

	// Handle the favicon
	if (req.url === '/favicon.ico') {
		res.writeHead(204);
		res.end();
		return;
	}

	// This request if for a file, check that it exists and serve it
	var file = path.join(directory, req.url);
	fs.exists(file, function(exists) {
		if (!exists) {
			res.writeHead(404);
			res.end();
			return;
		}

		fs.createReadStream(file).pipe(res);
	});
});

server.listen(3000, function () {
	console.log('Server listening on port 3000');
});

// Create the WebSocket server
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	connMgr.add(ws);
});