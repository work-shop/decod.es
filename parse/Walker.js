"use strict";

var fs = require('fs');
var path = require('path');
var walk = require('walkdir');
var util = require('util');

var Log = require('./Log')();

var SourceASTQuotient = require('./quotients/SourceASTQuotient' );
var ExampleASTQuotient = require('./quotients/ExampleASTQuotient' );


function Walker( args, source, callback ) {

	var file = require('./File')( args );

	try {

		var stats = fs.lstatSync( source = path.normalize( source ) );

		if ( stats.isDirectory() ) {

			var pathEmitter = walk( source );

			pathEmitter.on( 'file', function( filename ) { 

				file( filename, Log ).parse( function( err, result ) {

					if ( err ) throw err;

					console.log( util.inspect( result ) );

				});

			});

			//pathEmitter.on( 'end', function( ) { log.lock( function( methods ) { callback( null, log ); }); });



		} else if ( stats.isFile() ) {

			file( source, Log ).parse( SourceASTQuotient, function(  ) {

				Log.lock( function( methods ) { console.log( methods.print() ); } );

			});

		} else if ( stats.isSymbolicLink() ) {
			/**
			 * We've encountered a symbolic link. 
			 * Probably just ignore this / print an error message,
			 */

			console.log('symbolic link');
			callback( null, source );

		} else {

			console.log('weird path');
			util.inspect( stats );
			callback( stats );

		}

	} catch ( e ) {
		/**
		 * We've encountered an IOError from lstat, or else
		 * we've encountered an uncaught error from the parse
		 * process.
		 */
		callback( e );

	}

}

module.exports = Walker;