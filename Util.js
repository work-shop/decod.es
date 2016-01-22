"use strict";

var path = require('path');



function noop() {}

function concat( a,b ) {
	return a.concat( b );
}

function first( arr ) {
	return arr[0];
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

function empty( x ) {
	return x === "";
}

function not( x ) { return !x; }


function nullableWithDefault( value, andThen, alternate ) {
	if ( value === null ) return alternate;
	else return andThen( value );
}

module.exports = {
	noop: noop,
	prune: prune,
	last: last,
	first: first,
	repeat: repeat,
	concat: concat,
	compose: compose,
	not: not,
	nullableWithDefault: nullableWithDefault,
	empty: empty
};
