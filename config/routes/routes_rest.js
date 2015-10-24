module.exports = {
	'type' : 'REST',
	'services' : {
		"/id/:id" : [{
			"method" : "post",
			"event": "messageReceived"
		}]
	}
};
