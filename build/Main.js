"use strict";

//var Watcher = require('./Watcher');

var Dispatcher = require('./Dispatcher');

module.exports = function( args ) {

	if ( args.watch ) {

		new Watcher( args );

	} else {

		new Dispatcher( args ).db().render( function( log ) {

			process.stdout.write( log.print() );

			process.exit( 0 );

		});

	}

};
