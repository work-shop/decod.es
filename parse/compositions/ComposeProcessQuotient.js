"use strict";


module.exports = function ComposeProcessQuotient( args ) {
	
	return function ( Process, quotient ) {

		return function ( filepath, log, done ) {

			new Process( args )( filepath, log ).run( quotient( args ), done );

		};

	};

};