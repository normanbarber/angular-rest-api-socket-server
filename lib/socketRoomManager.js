var Rooms = require('./roomManager');
var Q = require('q');
var eventBus = require('./eventBus');

function SocketRoomManager() {
	var self = this;

	function sendToClients(clients, room, message, next) {
		if(clients && clients.length > 0){
			console.log('Broadcasting message to room ' + room.name);
			var promises = [];

			clients.forEach(function(client){
				console.log('Sending unfiltered message to client');
				client.write(message);
			});
			if (promises.length > 0) {
				Q.allSettled(promises)
					.then(function() {
						return next && next();
					});
			}
			else {
				return next && next();
			}
		} else {
			console.log('No clients found for message');
			return next && next();
		}
	}

	self.broadcastToRoom = function(event,url,data,next) {
		var message = {
			event: event,
			message: data
		};
		var room = self.getRoom(url);
		if (!room) {
			console.log('No room found for ' + url);
			eventBus.emit('roomNotFound', data);
			return next && next();
		}
		var clients = self.getClientsByRoom(url);

		eventBus.emit('roomFound', data);
		sendToClients(clients, room, message, next);
	}
}

SocketRoomManager.prototype = new Rooms();
module.exports = new SocketRoomManager();

