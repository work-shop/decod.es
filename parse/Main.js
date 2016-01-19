"use strict";


var walk = require('./Walker');


module.exports = function( args ) {

	walk( args, args.source, function( err, log ) {

		if ( err ) { console.error( err ); }

		else {

			process.stderr.write( log.print() );

			//process.stdout.write( util.inspect( log.json(), false, null) );

			process.exit( 0 );

		}

	});

};
