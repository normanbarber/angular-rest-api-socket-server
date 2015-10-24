'use strict';

var _ = require('lodash-node');
var path = require('path');

module.exports.register =  function(params){

	var app = params.app;
	var routes = params.routes;

	function render(options) {
		var options = options || {};
		return function(req, res) {
			var data = options.data || {};
			res.render(path.normalize(options.template), data);
		}
	}

	function handler(options) {
		var options = options || {};
		var provider = options.provider || {};
		var services = provider.services || {};
		var hnd = options.handler || {};
		if (services[hnd.method]) {

			return function(req,res,next) {
				return services[hnd.method](req,res,next);
			}
		}
		return function () {
			console.log('Warning, route handler ' + hnd.method + ' not found');
		};
	}

	function handleRequest(options) {
		var options = options || {};
		if (options.route.render) {
			return render({template: options.route.render.template, data: {title : 'data'}});
		}
		if (options.route.handler) {
			return handler({handler: options.route.handler, provider: options.provider});
		}
		return function() {
			console.log('Warning, no action defined for route: ' + options.route.route);
		}
	}

	_.each(routes,function(route){
		app[route.method](
			route.route,
			handleRequest({route: route})
		)
	})
};