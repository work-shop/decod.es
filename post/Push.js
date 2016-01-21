"use strict";

var equal = require('deep-equal');

var uuid = require('node-uuid');

var Firebase = require('firebase');

var Log = require('./ParseLog');


module.exports = function Push( args, expecting ) {
	if (! (this instanceof Push) ) { return new Push( expecting ); }
	var self = this;

	expecting = expecting || 0;

	var log = new Log( args, expecting );

	var db = new Firebase( args.firebase );
	
	//var db = require('./FirebaseHttp')( args );

	/**
	 * This integer counts the number of processes
	 * waiting for entry to the log structure.
	 *
	 * @type {Integer}
	 */
	var entries = 0;

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
			log.lock( function( childMethods ) {
				childMethods.record( timestamp, path, message, status );
			});
		},

		print: function() { 

			var logged = "";

			log.lock( function( childMethods ) {

				logged = childMethods.print();

			});

			return logged;

		},

		write: function( schemaPath, contentPath, value ) {

			schemaPath = normalizePath( schemaPath );

			contentPath = normalizePath( contentPath );

			function conclude( err ) {
				if ( err ) { throw err; }

				jsonStructure = traverse( schemaPath, jsonStructure, 0, value );

				jsonStructure = traverse( contentPath, jsonStructure, 0, value );

				entries += 1;

				if ( entries === expecting ) {

					conclusion( methods );

				}

			}

			try {

				// logic to consistently update the schema and content places for this object.

				var uuidKey = uuid.v4();

				var schemaString = pathOf( schemaPath );

				var contentString = pathOf( contentPath.concat( [uuidKey] ) );

				db.once('value', function( snapshot ) {

					if ( snapshot.hasChild( schemaString ) ) {

						var relative = snapshot.child( schemaString );

						uuidKey = relative.val().key;

						contentString = pathOf( contentPath.concat( [uuidKey] ) );

						db.child( contentString ).once('value', function( snapshot ) {

							if ( !equal(snapshot.val(), value) ) { 

								db.child( contentString ).set(value, function( err ) {
									if ( err ) throw err;

									db.child( schemaString ).set( {key: uuidKey, timestamp: Date.now()}, conclude );

								});

							} else {

								conclude();

							}

						});

					} else {

						db.child( contentString ).set(value, function( err ) {

							if ( err ) throw err;

							db.child( schemaString ).set( {key: uuidKey, timestamp: Date.now()}, conclude);

						});

					}


					
				});
				

			} catch ( e ) {

				console.log( Color.red.blink( 'problem') );

				console.log( e );

			} finally {



			}
		},

		json: function() {
			return jsonStructure;
		},

		close: function() {

			Firebase.goOffline();
			
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

};

function pathOf( array ) {
	return array.join( '/' );
}

function normalizePath( path ) {
	return path.map( function( x ) {
		return x.replace(/\s|\.|\-|\$/g, '');
	});
}

function traverse( path, object, keyindex, value ) {

	object = object || {};

	if ( keyindex >= path.length ) { 

		if ( Array.isArray( object ) ) {
			object.push( value );
			return object;
		}

		return [ value ]; 

	} else {

		object[ path[ keyindex ] ] = traverse( path, object[ path[ keyindex ] ], keyindex + 1, value);

		return object;

	}

}


