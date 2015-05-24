var WebSocketServer = require('ws').Server,
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	lobby = require('./lobby.js');

// The deploy directory is where we gonna server static files from
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
	serveStatic(res, file);
});

/**
 * Serves a static file
 * @param {object} res - The response object
 * @param {string} file - The requested file path
 */
function serveStatic(res, file) {
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
			serveStatic(res, defaultFile);
		} else {
			// Pipe the file over to the response
			fs.createReadStream(file).pipe(res);
		}
	});
}

var port = process.env.PORT || 3000;
server.listen(port, function () {
	console.log('Server listening on port:', port);
});

// Create the WebSocket server (it will handle "upgrade" requests)
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	lobby.add(ws);
});