'use strict';

var ExpressServer = require('../lib/expressServer');
var RestServer = require('../lib/restServer');
var SocketServer = require('../lib/socketServer');
var ProviderLoader = require('../lib/providersLoader');
var	path = require('path');

function Main() {

	return {
		start : function(config,root) {
			console.log('Starting Servers for Express, REST and Sockets');
			var providerPath = path.join(root, config.paths.providers);
			var providers = new ProviderLoader(config.providers, providerPath);
			if(config.servers.express){
				var webserver = new ExpressServer();
				webserver.configure(config);
				webserver.start();
			}
			if(config.servers.REST){
				var restapiserver = new RestServer();
				restapiserver.configure(config);
				restapiserver.start();
			}
			if (providers.Socket && config.servers.socket) {
				var socketServer = SocketServer;
				var socketProvider = providers.Socket;
				socketServer.configure(socketProvider, {
					socket_port: config.servers.socket.port
				});
				socketServer.start();
			}
		}
	}
}
module.exports = Main;