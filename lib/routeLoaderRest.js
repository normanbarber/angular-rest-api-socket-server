'use strict';

var _ = require('lodash-node');
var path = require('path');
var eventBus = require('./eventBus');

module.exports.register =  function(params){

	var app = params.app;
	var routes = params.routes;

	function createMessage(request, response, body) {
		var params = request.params;
		var result = {};
		for (var key in params) {
			result[key] = params[key];
		}
		var data = result;
		if (body && request.body) {
			data['body'] = request.body;
		}
		data.query = request.query;
		return data;
	}

	function handleRequest(handler, event, parseBody) {
		return function(request, response, next) {
			var data = createMessage(request, response, parseBody);
			if (event) {
				console.log('Passing data to event bus');
				var url = request.url;
				eventBus.publishEvent(event,{ source: 'REST', method: request.method, url: url, data: data});
				response.sendStatus(200);
			}
			return next && next();
		}
	}

	function configureRoute(app, path, service) {
		console.log('REST ' + service.method + ' registering route: ' + path);
		app[service.method](path, handleRequest(service.handler, service.event, true));
	}

	_.each(_.keys(routes.services), function(path) {
		if (routes.services[path] && routes.services[path].length > 0) {
			var route = routes.services[path];
			_.each(route, function(service) {
				console.log('Creatingg ' + service.method + ' route for ' + path);
				configureRoute(app, path, service);
			});
		}
	});

};