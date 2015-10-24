// application entry point
var path = require('path');
var config = require('config');

var Main = require('./lib/main.js');
var main = new Main();
main.start(config, __dirname);
