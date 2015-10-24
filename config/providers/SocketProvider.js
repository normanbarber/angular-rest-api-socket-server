var Q = require('q');
var rest = require('../../lib/restClient');
var util = require('util');
var config = require('config');

var provider = {
	type: "Socket",
	services: {
		createRoom: {
			handler: function(data){
				var deferred = Q.defer();
				deferred.resolve({
					"id": data.id
				});
				return deferred.promise;
			},
			room: {
				id: "|URL|",
				client: true,
				url: "/{id}"
			}
		},
		sendMessage: {
			handler: function(data){
				var deferred = Q.defer();
				var requestData = {
					message: data.message,
					sender: data.sender
				};
				console.log('data', data);
				var serviceCall = 'http://' + config.servers.REST.host + ':' + config.servers.REST.port + '/id/';
				var url = util.format(serviceCall + data.id);
				rest.request('POST', url, requestData, {json: true});
				deferred.resolve({
					"id": data.id,
					"sender": data.sender
				});
				return deferred.promise;
			}
		}
	},
	emitters : {
		events : [{'event' :  "messageReceived", 'room': '|URL|', pattern: "/{id}"}]
	}
};
module.exports = provider;