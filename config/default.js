module.exports = {
	client : {},
	paths : {
		providers : 'config/providers',
		routes : 'config/routes'
	},
	servers: {
		express: {
			host: 'localhost',
			port: 4000
		},
		socket : {
			host: 'localhost',
			port :  4002,
			timeout : 10000
		},
		REST : {
			host: 'localhost',
			port :  4001
		}
	},
	providers : ['SocketProvider']  // an array listing the names of all files in the config/providers folder
};