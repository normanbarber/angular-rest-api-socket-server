'use strict';

angular.module('rest.services', ['ngCookies'])
	.factory('apiProvider', ['$rootScope','$log', '$q','utilities','$window', 'config', '$timeout', function(root, log, Q, utils, window, config, $timeout) {
		var initialized, initTimeout, madeCalls = {}, deferredCalls = [], primus, socket_port, socket_timeout, socket_server,usr,context,url;
		socket_server = 'http://localhost';
		socket_port = 4002;
		socket_timeout = 10000;

		console.log(config.get('socket_server'));
		url = socket_server + ':' + socket_port;
		primus = window.Primus.connect(url);
		initTimeout = $timeout(function() {
			_.each(deferredCalls, rejectDeferred);
			deferredCalls = [];
			initialized = true;
			log.error('Socket connection timed out.')
		}, socket_timeout);

		function rejectDeferred(callObj){
			if(madeCalls.hasOwnProperty(callObj.id)) {
				log.error("Call timed out: ",madeCalls[callObj.id].name);
				root.$apply(madeCalls[callObj.id].deferred.reject({"errorNum" : 5, "errorMsg" : "Timeout calling server"}));
				delete madeCalls[callObj.id];
			}
		};

		function callTimeout(callObj) {
			return $timeout(function() { rejectDeferred(callObj) }, socket_timeout);
		}

		function handleCall(callObj) {
			callObj.timeout = callTimeout(callObj);
			primus.write(callObj);
		}

		primus.on('open', function (){
			log.info('Socket connection initialized.')
			_.each(deferredCalls, handleCall);
			deferredCalls = [];
			initialized = true;
			$timeout.cancel(initTimeout);
		});

		primus.on('data', function (resultObj) {
			if(madeCalls.hasOwnProperty(resultObj.id)){
				$timeout.cancel(resultObj.timeout);
				if (resultObj.result && resultObj.result.hasOwnProperty('errorNum')) {
					root.$apply(madeCalls[resultObj.id].deferred.reject(resultObj));
				}
				else if (resultObj.result && resultObj.result.hasOwnProperty('errno')) {
					root.$apply(madeCalls[resultObj.id].deferred.reject({errorNum: resultObj.result.errno, errorMsg: resultObj.result.code}));
				}
				else {
					root.$apply(madeCalls[resultObj.id].deferred.resolve(resultObj));
				}
				delete madeCalls[resultObj.id];
			}
			else if (resultObj.event && resultObj.message) {
				root.$emit(resultObj.event, resultObj.message);
			}
		});

		return {
			callFunction: function(name, params){
				var deferred = Q.defer(),
					callObj = {
						id: utils.getRandomID(10),
						name: name,
						params: params,
						user: usr,
						context: context
					};

				madeCalls[callObj.id] = {};
				madeCalls[callObj.id].deferred = deferred;
				madeCalls[callObj.id].name = name;

				if (initialized) {
					handleCall(callObj);
				} else {
					deferredCalls.push(callObj);
				}

				return deferred.promise;
			}
		};
	}])
	.factory('core', ['$cookies', function($cookies) {

		function run(m1, m2, s) {
			if (window[m1]) { return window[m1](s); } else { return base64[m2](s); }
		}

		var clientData = {};
		try {
			clientData = JSON.parse(run('atob', 'decode', $cookies.clientData));
		}
		catch(err) {
			clientData = {config: {}};
		}

		clientData.atob = function(s) { return run('atob', 'decode', s); };
		clientData.btoa = function(s) { return run('btoa', 'encode', s); };

		return clientData;
	}])
	.factory('config', ['core', function(core) {
		return {
		  get: function(key) {
			return core.config[key];
		  }
		};
	}])
	.factory('utilities', ['$log', function(log){
		var Service = {};
		Service.getRandomID = function (length){
			var id = '';
			var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for( var i=0; i < length; i++ ) {
				id += possible.charAt(Math.floor(Math.random() * possible.length));
			};
			return id;
		};
		return Service;
	}])
