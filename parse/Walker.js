"use strict";

var fs = require('fs');
var path = require('path');
var walk = require('walkdir');
var util = require('util');
// var Printer = require('../print/Main');

function Walker( args, source, callback ) {

	var file = require('./File')( args );

	try {

		var stats = fs.lstatSync( source = path.normalize( source ) );

		var log = require('./Log')();

		if ( stats.isDirectory() ) {



			var pathEmitter = walk( source );

			pathEmitter.on( 'file', function( filename ) { 

				file( filename, log ).parse( function( err, ast ) {

					if ( err ) throw err;

					console.log( util.inspect( ast ) );

				});

			});

			//pathEmitter.on( 'end', function( ) { log.lock( function() { callback( null, log ); }); });



		} else if ( stats.isFile() ) {



			file( source, log ).parse( function( err, ast ) {

				if ( err ) throw err;

				try {

					var astStructure = JSON.parse( ast );

					console.log( util.inspect( astStructure.ast, false, null, true) );

				} catch ( parseError ) {

				} 


			});

			//log.lock( function() { callback( null, log ); });



		} else if ( stats.isSymbolicLink() ) {

			console.log('symbolic link');
			callback( null, source );

		} else {

			console.log('weird path');
			util.inspect( stats );
			callback( stats );

		}

	} catch ( e ) {

		callback( e );

	}

}

module.exports = Walker;