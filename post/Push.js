"use strict";

var Firebase = require('firebase');

var noop = function() {};

module.exports = function Push( args, expecting ) {
	if (! (this instanceof Push) ) { return new Push( expecting ); }
	var self = this;

	var db = new Firebase( args.firebase );

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

		record: noop,

		print: noop,

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

			var payload = traverse( {}, 0, JSONValue );

			var relative = db.child( pathOf( JSONKeypath ) );

			relative.transaction( function ( object ) {
				if ( Array.isArray( object ) ) {

					object.push( JSONValue );

					return object;

				} else {

					return JSONValue;

				}

			}, function ( err, status, result ) {

				traverse( jsonStructure, 0, JSONValue );

			}, false);

		},

		json: function() {
			return jsonStructure;
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

			entries += 1;

			locked = false;

		} else {	

			self.lock( continuation );

		}

		if ( entries === expecting ) { conclusion( methods ); }
	};


	self.conclude = function( continuation ) { conclusion = continuation; };

};

function pathOf( array ) {
	return array.join('/');
}


