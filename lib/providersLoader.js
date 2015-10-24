'use strict';

var _ = require('lodash-node'),
	path = require('path');

module.exports = function(providers, providerpath) {

	var self = this;
	var serviceType;

	_.each(providers, function(provider) {
		var method = require(path.join(providerpath, provider));

		/* throws error if none of the values pushed to the providers array(config/default.js) do not match any filenames in the directory config/providers  */
		if (method.hasOwnProperty('type')) {
			serviceType = method.type;
		} else {
			console.log('Provider Type Not Found');
			console.log('Unable to find any provider types defined in: ' + method);
			throw (new Error('Provider Type Not Found'));
		}
		self[serviceType] = method;
	});
};