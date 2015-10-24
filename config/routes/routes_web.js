module.exports = function(){
	// these are all application routes for webserver
	return [
		{
			// when a request is made to the app root, render index tpl
			method: 'get',
			route: '/',
			render: {
				template: 'index'
			}
		},
		{
			// when a user posts at the login page, call handleLoginRequest() from config/providers/loginProvider.js
			// note: this route is only an example for posting on user login and does not yet have any actions in the working demo
			// this loginProvider could be extended or added easily and is a good way to gain better understanding of how the Providers work on a post method
			method: 'post',
			route: '/login',
			handler: {
				module: 'loginProvider',
				method: 'handleLoginRequest'
			}
		}
	]
};