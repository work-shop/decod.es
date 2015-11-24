"use strict";

var Table = require('cli-table2');
var Color = require('cli-color');

function Log( args ) {
	if ( !( this instanceof Log )) { return new Log( args ); }
	var self = this;

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
		head: ["status", "file", "message", "timestamp"],
		colWidths: [10,40,20,20],
		wordWrap: true,
		style: {
			head: []
		}
	});

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
			recordStructure.push( [ 
				colorStatus( status ),
				path,
				( typeof message !== undefined ) ? message : "",
				timestamp
			] );
		},

		write: function( JSONkeypath, JSONValue ) {

		},
		print: function() {
			return recordStructure.toString();
		},
		json: function() {

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
		while ( locked );

		if ( !locked) {

			locked = true;

			continuation( methods );

			locked = false;

		} else {

			self.lock( continuation );

		}
	};


}

function colorStatus( status ) {
	switch( status ) {
		case "OK": 
			return Color.green.bold( status );

		case "Syntax":
		case "PY IO":  
			return Color.yellow.bold( status );

		case "JS IO": 
			return Color.red.blink( status );
	}
}

module.exports = Log;