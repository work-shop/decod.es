"use strict";

var util = require('util');

var walk = require('./Walker');

module.exports = function( args ) {

	walk( args, args.source, function( err, structure ) {

		if ( err ) { console.error( err ); }

		console.dir( util.inspect( structure ) );
		
	});

};
