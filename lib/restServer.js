'use strict';

var express = require('express');
var bodyParser = require('restify').bodyParser({mapParams: false});
var routesRest = require('../config/routes/routes_rest');
var routeLoaderRest = require('./routeLoaderRest');
var cors = require('cors');

module.exports = function RestServer() {

	var app = express();
	var server;
	var host;
	var port;

	function setRequestHeader() {
		return function(request, response, next) {
			request.getContentLength = function() {
				if (this.content_length !== undefined)
					return (this.content_length === false ? undefined : this.content_length);

				var length = this.header('content-length');
				if (!length) {
					this.content_length = false;
				} else {
					this.content_length = parseInt(length, 10);
				}

				return (this.content_length === false ? undefined : this.content_length);
			};

			request.contentLength = request.getContentLength;

			request.getContentType = function() {
				if (this.content_type !== undefined)
					return (this.content_type);

				var index;
				var type = this.header('content-type');

				if (!type) {
					this.content_type = 'application/octet-stream';
				} else {
					if ((index = type.indexOf(';')) === -1) {
						this.content_type = type;
					} else {
						this.content_type = type.substring(0, index);
					}
				}
				return (this.content_type);
			};

			request.contentType = request.getContentType;
			return next && next();
		}
	}

	return {
		configure :  function(config) {
			var options = config || {};
			port = options.servers.REST.port || 4001;
			host = options.servers.REST.host || 'localhost';
			app.use(setRequestHeader());
			app.use(bodyParser[0]);
			app.use(bodyParser[1]);
			app.use(express.query());
			app.use(cors());
			routeLoaderRest.register({
				app: app,
				routes: routesRest
			});
		},
		start : function() {
			server = app.listen(port, function(){
				console.log('REST server listening on port ' + port);
			});
		},
		stop : function() {
			server.close(function() {
				console.log('REST server stopping');
			});
		}
	};
};