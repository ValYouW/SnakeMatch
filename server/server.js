var WebSocketServer = require('ws').Server,
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	connMgr = require('./lobby.js');

var DEPLOY_DIR = path.resolve(__dirname, '../client/deploy');
var DEFAULT_FILE = 'index.html';

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

	// This request if for a file
	var file = path.join(DEPLOY_DIR, req.url);
	serveStatic(req, res, file);
});

function serveStatic(req, res, file) {
	// Get the file statistics
	fs.lstat(file, function(err, stat) {
		// If err probably file does not exist
		if (err) {
			res.writeHead(404);
			res.end();
			return;
		}

		// If this is a directory we will try to serve the default file
		if (stat.isDirectory()) {
			var defaultFile = path.join(file, DEFAULT_FILE);
			serveStatic(req, res, defaultFile);
		} else {
			fs.createReadStream(file).pipe(res);
		}
	});
}

server.listen(3000, function () {
	console.log('Server listening on port 3000');
});

// Create the WebSocket server
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	connMgr.add(ws);
});