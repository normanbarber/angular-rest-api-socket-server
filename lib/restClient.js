var request = require('request'),
  Q = require('q');

function call(method, url, data, options) {
	var deferred = Q.defer();
	var uri = url;
	var opts = {
		method: method,
		uri: uri,
		headers: {
			'x-origin-app': true
		}
	};

	if (data && options && options.json) {
		opts.json = data;
	} else if (data) {
		opts.body = data;
	}

	request(opts, function(error, response, body) {
		if (error) {
			deferred.reject({code: 500,message: error});
			return;
		}
		deferred.promise = (response.statusCode >= 200 && response.statusCode <= 299) ? deferred.resolve(body) : deferred.reject({code: response.statusCode,message: body});
	});

	return deferred.promise;
}

function RestClient() {
	return {
		request : function(method, url, data, options) {
			return call(method, url, data, options);
		}
	};
}

module.exports = new RestClient();