"use strict";

var nodepath = require('path');

var Table = require('cli-table2');
var Color = require('cli-color');

function ParseLog( args, expecting ) {
	if ( !( this instanceof ParseLog )) { return new ParseLog( args, expecting ); }
	var self = this;

	/**
	 * This integer counts the number of processes
	 * waiting for entry to the log structure.
	 *
	 * @type {Integer}
	 */
	var entries = 0;

	/**
	 * This Boolean Mutex is used to manage
	 * the concurrent access to the log across
	 * asynchronous code blocks.
	 *
	 * @type {Boolean}
	 */
	var locked = false;

	/**
	 * The record structure stores a linear order of stamps
	 * recording the order, status, and message of each of the
	 * files encountered by walkers using this Log.
	 *
	 * @type {Array}
	 */
	var recordStructure = new Table({
		head: [ "file","status", "message", "timestamp"],
		colWidths: [80,10,30,20],
		wordWrap: true,
		style: {
			head: []
		}
	});

	var conclusion = function() {};

	/**
	 * this object contains the incremental parse context, as we traverse
	 * a sequence of files.
	 *
	 * @type {Object}
	 */
	var jsonStructure = {};

	/**
	 * The methods contained in this datastructure are
	 * allow the process to mutate the the state of the log.
	 * access to this structure only permitted through the
	 * lock method, and then only if the entry is
	 *
	 * @type {Object}
	 */
	var methods = {

		record: function( timestamp, path, message, status ) {

            var p = nodepath.parse( path );
            var dirs = p.dir.split(nodepath.sep);

			recordStructure.push( [
				[ dirs[ dirs.length-1 ], p.base].join( Color.blue( ' '+nodepath.sep+' ' ) ),
				colorStatus( status ),
				Color.white.bold( message ),
				timestamp
			] );

		},

		write: function( JSONKeypath, JSONValue ) {

			function traverse( object, keyindex, value ) {

				object = object || {};

				if ( keyindex >= JSONKeypath.length ) {

					if ( Array.isArray( object ) ) {
						object.push( value );
						return object;
					}

					return [ value ];

				} else {

					object[ JSONKeypath[ keyindex ] ] = traverse( object[ JSONKeypath[ keyindex ] ], keyindex + 1, value);

					return object;

				}

			}

			return traverse( jsonStructure, 0, JSONValue );

		},
		print: function() {
			return recordStructure.toString();
		},
		json: function() {
			return jsonStructure;
		},
		close: function() {

		},
		expect: function( update ) {
			expecting = update( expecting );
		}
	};

	/**
	 * the lock method blocks until obtaining a lock on
	 * this log's mutex, and executes a continuation when
	 * the mutext is obtained;
	 *
	 * @param  {Object -> ()} continuation [description]
	 * @return {()}              [description]
	 */
	self.lock = function( continuation ) {

		continuation( methods );

	};


	self.conclude = function( continuation ) { conclusion = continuation; };

}

function colorStatus( status ) {
	switch( status ) {
		case "OK":
			return Color.green( status );

		case "Skipped":
			return Color.blue( status );

		case "Parse":
		case "Syntax":
			return Color.yellow.bold.blink( status );

		case "PY IO":
		case "JS IO":
			return Color.red.bold.blink( status );
	}
}

module.exports = ParseLog;
