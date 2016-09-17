"use strict";

var walk = require('walkdir');

var Pusher = require('../post/Push');

var Rules = require('./rules/Rules' );

var noop = function () {};

function Walker( args, source, callback ) {

	try {

		var rules = new Rules( args );

		var Push = new Pusher( args );

		walk( source ).on( 'file', function( filename ) {

			 rules( filename, Push, noop );

		});

		Push.conclude( function( methods ) {

			methods.close();

			callback( null, methods );

		} );

	} catch ( e ) {

		callback( e );

	}

}

module.exports = Walker;
