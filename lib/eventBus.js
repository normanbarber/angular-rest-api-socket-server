'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function EventBus(){

	EventEmitter.call(this);

	this.publishEvent = function(event, data) {
		console.log('Publish event ' + event + ': ' + JSON.stringify(data));
		this.emit(event,data);
	};
}

util.inherits(EventBus, EventEmitter);
module.exports = new EventBus();
