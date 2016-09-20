"use strict";

var fs = require('fs');

module.exports = function( app, socket, options ) {

	if ( options.development ) {

		app.listen( options.port, function () {
			console.log('Server listening on port ' + options.port );
		});

	} else {

		try {

			if ( fs.statSync( socket ).isSocket() ) {

				fs.unlinkSync( socket );

			}

		} catch ( e ) {}


		app.listen( socket );

		fs.chmodSync( socket, 777 );

		process.on('SIGINT', function( ) { process.exit(0); });

		process.on('SIGTERM', function( ) { process.exit(0); });

		process.on('exit', function( ) {

			fs.unlinkSync( socket );

		});


	}

};
