/*
* Messages
* --------
* Ready: 1#playerIndex#boardWidth#boardHeight#cellSize
*
* Steady: 2#timeToStart
*
* Go: 3
*
* Update: 4#player1Direction#player2Direction#pellets#score
*     pellets - cellIndex,cellIndex,cellIndex...
*     score - player1Score,player2Score
*
* PeerDisconnect: 5
*
*
* */

var MESSAGES = {
	PENDING: '1',
	READY: '2',
	STEADY: '3',
	GO: '4',
	UPDATE: '5',
	PEER_DISCONNECT: '6'
};

var DATA = {
	DATA_SEP: '#',
	OBJ_SEP: ',',
	UP: '8',
	RIGHT: '6',
	DOWN: '2',
	LEFT: '4'
};

var Protocol = {};
module.exports = Protocol;

Protocol.buildPending = function() {
	return MESSAGES.PENDING;
};

Protocol.buildReady = function(playerIndex, boardWidth, boardHeight, cellSize) {
	return [MESSAGES.READY, playerIndex, boardWidth, boardHeight, cellSize].join(DATA.DATA_SEP);
};

Protocol.buildSteady = function(tts) {
	return [MESSAGES.STEADY, tts].join(DATA.DATA_SEP);
};

Protocol.buildPeerDisconnect = function() {
	return MESSAGES.PEER_DISCONNECT;
};