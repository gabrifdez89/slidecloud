var socketio = require('socket.io');

module.exports = {
	listen: listen
};

function listen (server) {
	var io = socketio.listen(server);
	io.on('connection', function(socket) {
		console.log('NEW USER CONNECTED TO SOCKET.IO');
	});
	return io;
};