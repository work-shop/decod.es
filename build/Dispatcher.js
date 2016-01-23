"use strict";



var util = require('util');

var path = require('path');

var sep = path.sep;

var async = require('async');

var Firebase = require('firebase');

var Renderer = require('./Renderer');

var walk = require('object-walk');

var Log = require('../post/RenderLog');

module.exports = function Dispatcher( args ) {
	if ( !(this instanceof Dispatcher) ) { return new Dispatcher( args, db ); }
	var self = this;

	var db;

	var log = new Log( args );

	var renderer = new Renderer( args );

	/**
	 * Bind a firebase instance to this dispatcher. Leave db undefined
	 * to bind a new instance. This method should be called before any
	 * further methods are called.
	 * 
	 * @param  {Firebase | undefined} db a database connection to mount
	 * @return {Dispatcher}    self
	 */
	self.db = function( ref ) {

		db = ref || new Firebase( args.firebase );

		return self;

	};


	self.render = function( continuation  ) {
		if ( typeof db === "undefined" ) { self.db(); }
		
		db.once('value', render( renderer, continuation, log ) );

	};

};

function render( renderer, continuation, log ) {
	return function( snapshot ) {
		var data = snapshot.val();

		if ( structurallyConsistent( data ) ) {

			var pathlist = definePathList( "schema", data.schema );

			var context = unify( data.schema, data.content, [] );

			//console.log( util.inspect( context, true, 3) );

			async.each( pathlist, 
				function( path, callback ) {

					var resolution = getContextFor( path, context, data.content );

					renderer.render( resolution.path, resolution.context, log, data.names, callback );

				},  
				function( err ) {

					if ( err ) { 
						
						log.addLine( "", "", "IO", err.message, Date.now() );

					}

					continuation( log );

				}
			);

		} else {

			console.log( 'error case' );

			log.addLine( "", "", "Inconsistency", "Bad Data!", Date.now() );

			continuation( log );

		}

	};
}

function unify( schema, content, path ) {

	if ( terminal( schema ) ) {

		var data = content[ schema.key ];

		Object.defineProperty( data, '_id', {
			enumerable: true,
  			value: schema.key
		});

		Object.defineProperty( data, '_modified', {
			enumerable: true,
  			value: schema.timestamp
		});

		Object.defineProperty( data, '_url', {
			enumerable: true,
  			value: sep + path.join( sep )
		});

		return data;


	} else if ( schema !== null && typeof schema === "object" ) {	

		for ( var key in schema ) {
			if ( schema.hasOwnProperty( key ) ) {

				schema[ key ] = unify( schema[ key ], content, path.concat( [key] ) );

				Object.defineProperty( schema[ key ], '_name', {
					enumerable: true,
		  			value: (typeof schema[key].name !== "undefined") ? schema[key].name : key
				});

			}
		}

		Object.defineProperty( schema, '_url', {
			enumerable: true,
  			value: sep + path.join( sep )
		});

		return schema;

	} else {

		return schema;

	}

}

function trimObject( path, object ) {

	path.forEach( function( component ) {

		object = object[ component ];

	});

	return object;
}


function getContextFor( path, data, content ) {

	var rootpoint = path.split( sep ).filter( function( x ) { return x !== "" && typeof content[ x ] === "undefined"; });

	return {
		path: rootpoint,
		context: {
			data: data,
			item: trimObject( rootpoint, data ),			
		}
	};

}

function definePathList( key, value ) {

	if ( terminal( value ) ) {

		return [ value.key ];

	} else if ( value !== null && typeof value === "object" ) {	

		var paths = [];	

		for ( var index in value ) {
			if ( value.hasOwnProperty( index ) ) {

				paths = paths.concat( definePathList( index, value[index] ).map( function( subpath ) {

					return index + sep + subpath;

				}) );
			}
		}

		return paths.concat( [ "" ] );

	} else {

		return [];

	}
}


function structurallyConsistent( snapshot ) {
	return !(snapshot.schema === "undefined" || snapshot.content === "undefined" || snapshot.names === "undefined");
	
}

function terminal( object ) {
	return typeof object === "undefined" || (typeof object.key !== "undefined" && typeof object.timestamp !== "undefined");
}

function first( arr ) {
	return arr[ 0 ];
}

function last( arr ) {
	return arr[ arr.length - 1 ];
}

