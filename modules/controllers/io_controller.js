var socketio = require('socket.io');

module.exports = {
	listen: listen
};

function listen (server) {
	var io = socketio.listen(server)
	currentPageMap = {};

	io.on('connection', connection);

	function connection (socket) {
		var callbackArgument = {socket: socket};
		console.log('NEW USER CONNECTED');

		socket.on('disconnect', onDisconnect);
		socket.on('createNamespace', createNamespace.bind(callbackArgument));
	};

	function onDisconnect () {
		console.log('USER DISCONNECTED');
	};

	function createNamespace (namespace) {
		var nsp = io.of(namespace),
			callbackArgument = {nsp: nsp, namespace: namespace};
		console.log('CREATED NAMESPACE: ' + namespace);
		currentPageMap[namespace] = 1;
		nsp.on('connection', onNamespaceConnection.bind(callbackArgument));
		this.socket.emit('namespaceCreated', namespace);
	};

	function onNamespaceConnection (socket) {
		var callbackArgument = {nsp: this.nsp, namespace: this.namespace, socket: socket};
		console.log('NEW USER CONNECTED TO A NAMESPACE');
		socket.on('goToPage', goToPage.bind(callbackArgument));
		socket.on('whatIsCurrentPage', currentPageIs.bind(callbackArgument));
	};

	function goToPage (pageNum) {
		console.log('goToPage ' + pageNum + ' message emitted');
		this.nsp.emit('goToPage', pageNum);
		currentPageMap[this.namespace] = pageNum;
	};

	function currentPageIs () {
		this.socket.emit('goToPage', currentPageMap[this.namespace]);
	};

	return io;
};