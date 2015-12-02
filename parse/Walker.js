"use strict";

var fs = require('fs');
var path = require('path');
var walk = require('walkdir');
var util = require('util');

var Logger = require('./Log');

var Rules = require('./rules/Rules' );

var noop = function () {};

function Walker( args, source, callback ) {

	try {

		var rules = new Rules( args );

		var Log = new Logger( countFilesSync( source = path.normalize( source ) ) );

		var pathEmitter = walk( source );

		pathEmitter.on( 'file', function( filename ) { 
			/**
			 * 
			 * We've encountered a file of some kind. What we'd like to do 
			 * is ensure that the file matches one of our rules, and then
			 * have it execute the rule on the match it encounters.
			 * 
			 */

			 rules( filename, Log, noop );

			//file( filename, Log ).parse( Rules, noop );

		});

		Log.conclude( function( methods ) { 

			console.log( methods.print() ); 

			//console.log( util.inspect( methods.json(), false, null, true ) );

		} );

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

	var stats = fs.lstatSync( source );

	if ( stats.isFile() ) {

		return 1;

	} else if ( stats.isDirectory() ) {

		return walk.sync( source ).reduce( function(b,a) {

			var stat = fs.lstatSync( a );
			return ( stat.isFile() ) ? b + 1 : b;

		}, 0);

	} else {

		throw new Error("SourceError: the specified path is neither a file nor a directory" );

	}
	
}

module.exports = Walker;