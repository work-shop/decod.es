"use strict";

var path = require('path');

function noop() {}

function concat( a,b ) {
	return a.concat( b );
}

function last( arr ) {
	return arr[ arr.length - 1 ];
}

function prune( subpath, superpath ) {
	return last( subpath.split( path.sep ) ) + superpath.substring( subpath.length );
}

function repeat( value, n ) {
	return Array.apply( null, new Array( n ) ).map( function() { return value; } ); 
}

function compose( g, f ) {
	return function( x ) {
		return g( f( x ) );
	};
}

function not( x ) { return !x; }

module.exports = {
	noop: noop,
	prune: prune,
	last: last,
	repeat: repeat,
	concat: concat,
	compose: compose,
	not: not
};
