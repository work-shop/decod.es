"use strict";

var pkg = require('../package.json');
var listen = require('./Listen');

var bodyParser = require('body-parser');

module.exports = function( express, app, options ) {
	return function() {

        app.use( bodyParser.json() );

		app.get('/', function(req, res) {
            res.end('Hello, World\n');
        });

        app.post('/', function(req, res) {
            console.log(require('util').inspect( req.body, { depth: null }));
            res.end();
        });

		listen( app,  [pkg.name, '.sock' ].join(''), options );

	};

};
