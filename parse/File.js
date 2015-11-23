"use strict";


var path = require( 'path' );
var python = require('python-shell');

var pythonMain = "Main.py";

//var ruleset = require('./rules/Rules');


module.exports = function ( args ) {

	var configuration = {
		mode: 'text',
		pythonPath: path.join( path.resolve( args.parse_tool ), '.env', 'bin', 'python' ),
		pythonOptions: ['-u'],
		scriptPath: path.resolve( args.parse_tool )
	};

	return function File( filename, log ) {
		if ( !(this instanceof File) ) { return new File( filename, log ); }
		var self = this;

		self.parse = function( continuation ) {

			configuration.args = [ '-p', path.resolve( filename ) ];

			python.run(
				pythonMain,
				configuration,
				function( pythonError, result ) {

					if ( pythonError ) { dispatch( continuation, pythonError ); }

					else {

						try {

							//var output = JSON.parse( result );

							var output = result;


							dispatch( continuation, null, output );

						} catch( parseError ) {

							dispatch( continuation, parseError );

						}

					}

				}
			);
		};

		var dispatch = function( continuation, error, result ) {

			continuation( error, result );

		};

		// var log = function( continuation, error, result ) {

		// };
	};
};

