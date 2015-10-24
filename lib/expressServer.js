'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var routesWeb = require('../config/routes/routes_web');
var routeLoaderWeb = require('./routeLoaderWeb');

module.exports = function ExpressServer() {
	var app = express();
	var server;
	var port;
	return {
		configure : function(config) {
			var options = config || {};
			port = options.servers.express.port || 4000;
			app.set('views', path.join(__dirname, '..', '/public/views'));
			app.set('view engine', 'jade');
			app.set('title', options.appName || 'REST api for Angular');
			app.use(bodyParser.json());
			app.use(express.static(path.join(__dirname, '..', 'public')));
			routeLoaderWeb.register({
				app: app,
				routes: routesWeb()
			});
		},
		start : function() {
			server = app.listen(port, function(){
				console.log('Express server listening on port ' + port + ' in ' + app.settings.env + ' mode');
			});
		},
		stop : function() {
			server.close(function() {
				console.log('Express server stopping');
			});
		}
	};
};