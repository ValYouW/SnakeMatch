var WebSocketServer = require("ws").Server,
	restify = require("restify");

var server = restify.createServer();
server.listen(3000, function () {
	console.log('socket.io server listening at %s', server.url);
});

server.get('/public', restify.serveStatic({
	directory: __dirname,
	default: 'index.html'
}));

var wss = new WebSocketServer({server: server});
wss.on("connection", function(ws) {
	var id = setInterval(function() {
		ws.send(JSON.stringify(new Date()), function() {  })
	}, 1000);

	console.log("websocket connection open");

	ws.on("close", function() {
		console.log("websocket connection close");
		clearInterval(id)
	})
});