'use strict';
angular.module('Controllers', ['rest.services'])
	.controller('MainController', ['$rootScope', '$scope', '$log', 'apiProvider',  function(root, scope, log, apiProvider){
		log.log('Loading main controller');

		scope.user1 = 'someuser1';
		scope.user2 = 'someuser2';

		root.$on('messageReceived', function (event, message) {
			log.log('Event messageReceived : ' + JSON.stringify(message));
		});

		scope.createRoom = function(element){
			console.log('cleint create room');

			scope.contactname = element.target.attributes['name'].value;
			scope.username = 'yourname';

			apiProvider.callFunction('createRoom',{id:scope.contactname})
				.then(function(message){
					log.log('Result of createRoom is ' + JSON.stringify(message.result));
				});
		};

		scope.sendMessage = function(){
			var msgvalue = angular.element(document.querySelector('.message'))[0].value;

			apiProvider.callFunction('sendMessage',{id:scope.contactname, sender:scope.username, message:msgvalue})
				.then(function(message){
					log.log('Result of sendMessage is ' + JSON.stringify(message));
					angular.element(document.querySelector('.message'))[0].value = '';
				});
		};
	}]);