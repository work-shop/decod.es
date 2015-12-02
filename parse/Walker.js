"use strict";

var fs = require('fs');
var path = require('path');
var walk = require('walkdir');
var util = require('util');

var Logger = require('./Log');

var rules = require('./rules/Rules' );

function Walker( args, source, callback ) {

	var file = require('./File')( args );

	try {

		var Log;

		var Rules = new rules( args );

		var stats = fs.lstatSync( source = path.normalize( source ) );

		if ( stats.isDirectory() ) {

			Log = new Logger( countFilesSync( source ) );

			var pathEmitter = walk( source );

			pathEmitter.on( 'file', function( filename ) { 

				file( filename, Log ).parse( Rules, function() {});

			});

			Log.conclude( function( methods ) { 

				console.log( methods.print() ); 

				//console.log( util.inspect( methods.json(), false, null, true ) );

			} );


		} else if ( stats.isFile() ) {



			Log = new Logger( 1 );

			file( source, Log ).parse( Rules, function() {} );

			Log.conclude( function( methods )  { 

				console.log(methods.print()); 
				console.log( util.inspect( methods.json(), false, null, true )  );

			} );




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

function countFilesSync( source ) {
	return walk.sync( source ).reduce( function(b,a) {
		var stat = fs.lstatSync( a );
		return ( stat.isFile() ) ? b + 1 : b;
	}, 0);
}

module.exports = Walker;