var socketio = require('socket.io');

module.exports = {
	listen: listen
};

function listen (server) {
	var io = socketio.listen(server);

	io.on('connection', connection);

	function connection (socket) {
		console.log('NEW USER CONNECTED');

		socket.on('disconnect', onDisconnect);
		socket.on('createNamespace', createNamespace);
	};

	function onDisconnect () {
		console.log('USER DISCONNECTED');
	};

	function createNamespace (namespace) {
		var nsp = io.of(namespace),
			callbackArgument = {nsp: nsp};
		console.log('CREATED NAMESPACE: ' + namespace);
		nsp.on('connection', onNamespaceConnection.bind(callbackArgument));
	};

	function onNamespaceConnection (socket) {
		var callbackArgument = {nsp: this.nsp};
		console.log('NEW USER CONNECTED TO A NAMESPACE');
		socket.on('goToPage', goToPage.bind(callbackArgument));
	};

	function goToPage (pageNum) {
		console.log('goToPage ' + pageNum + ' message emitted');
		this.nsp.emit('goToPage', pageNum);
	};

	return io;
};