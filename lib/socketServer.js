'use strict';

var Primus = require('primus');
var http = require('http');
var cookie = require('cookie');
var connect = require('connect');
var eventBus = require('../lib/eventBus');
var utils = require('../lib/utils');
var _ = require('lodash-node');
var path = require('path');

function SocketServer() {

	var self = this;
	var socketBroadcast;
	var services, emitters, socket_port, auth_cookie_name, auth_secret;

	self.configure = function (provider, options) {
		console.log('Configuring Socket Server');
		options = options || {};

		socket_port = options.socket_port || 3000;
		auth_cookie_name = options.auth_cookie_name || 'mca.sid';
		auth_secret = options.auth_secret || 'mca123';

		socketBroadcast = require('./socketRoomManager');

		services = provider.services;
		emitters = provider.emitters || [];
	};

	self.handleDisconnect = function (socket) {
		return function () {
			console.log('Disconnect received from client ' + socket.id);
			socketBroadcast.removeClientFromRooms(socket, 'id');
		}
	};

	self.handleMessage = function (socket) {
		return function (msg) {
			console.log('Received Call from ' + socket.id + ' for ' + msg.name);
			var room = {}, roomId, desiredRoom, promise;

			if (services[msg.name].room) {
				_.extend(room, services[msg.name].room);

				if (!room.filter) {
					room.filter = services[msg.name].filter;
				}
				roomId = getRoomId(room, msg);
				room.id = roomId;
				room.mappedUri = utils.mapUriParams(room.url, msg.params);

				desiredRoom = socketBroadcast.getRoom(roomId);

				if (!desiredRoom) {
					desiredRoom = socketBroadcast.createRoom(room);
				}

				if (room.client) {
					desiredRoom.addClient(socket, 'id');
				}
			} else {
				console.log('No room for found service ' + msg.name)
			}

			console.log('Invoking handler for ' + msg.name);
			if(services[msg.name].handler){
				promise = services[msg.name].handler(msg.params);
				if (promise != undefined && promise.hasOwnProperty('promiseDispatch')) {
					promise.then(function (returnedResult) {

						if (services[msg.name].filter) {
							console.log('Applying filter to handler result for ' + msg.name);
							return services[msg.name].filter({message: returnedResult})
								.then(function (res) {
									socket.write({
										id: msg.id,
										name: msg.name,
										timeout: msg.timeout,
										result: res.message
									});
								});
						}
						else {
							console.log('No filter for handler result for ' + msg.name);
							socket.write({
								id: msg.id,
								name: msg.name,
								timeout: msg.timeout,
								result: returnedResult
							});
						}
					}, function (error) {
						var result = {};
						result.id = msg.id;
						result.name = msg.name;
						result.timeout = msg.timeout;
						result.result = error;
						socket.write(result);
					});
				} else {
					console.log('Rejecting call : Handler did not return a promise or promise is undefined');
					var error = {};
					error.id = msg.id;
					error.name = 'error';
					error.timeout = msg.timeout,
						error.result = {
							'errorNum': 3,
							'errorMsg': 'Improperly implemented method handler',
							'errorDesc': 'Handler did not return a promise'
						};
					socket.write(error);
				}
			}

		};
	};

	var getRoomId = function (room, msg) {
		return utils.mapUriParams(room.url, msg.params);
	};

	self.start = function () {
		console.log('Starting socket server on port ' + socket_port);
		var server = http.createServer().listen(socket_port,
			function() {
				console.log('Primus started and listening on port ' + socket_port);
			});
		self.primus = new Primus(server,{ transformer: 'engine.io' });
		self.primus.save(path.join(__dirname,'/../public/js/lib/primus.js'));

		self.primus.on('connection', function (spark) {
			console.log('Connection received from client ' + spark.id);
			spark.on('data', self.handleMessage(spark));
			spark.on('end', self.handleDisconnect(spark));
		});
		_.each(emitters.events, function (emitter) {
				eventBus.on(emitter.event, function (data) {
					if (emitter.room === '|URL|') {
						console.log('Passing event [' + emitter.event + '] to room ' + data.url);
						socketBroadcast.broadcastToRoom(emitter.event, utils.ensureLeadingSlash(data.url), {data: data.data});
					}
				});
			});
	};

	self.stop = function () {
		self.primus.end();
	};
}

module.exports = new SocketServer();
