"use strict";

var utilities = require('../../../Util');

var nonempty = utilities.compose( utilities.not, utilities.empty );

var dotPlaceholder = '&';
var slashPlaceholder = '@';

module.exports = {
	description: function( docstring ) {

		return extractValue(  /(^[\s\S]*?)(?=:param|:type|:return|:rtype|:image|$)/.exec( docstring ) );

	},
	params: function( docstring ){

		return extractRSTStrings( /:param\s*([\S]*):\s*([^:]*)\s*:?/g, docstring );

	},
	types: function( docstring ) {

		return extractRSTStrings( /:type\s*([\S]*):\s*([^:]*)\s*:?/g, docstring );

	},
	rvalue: function( docstring ) {

		return extractRSTStrings( /:result\s*([\S]*):\s*([^:]*)\s*:?/g, docstring );

	},
	rtype: function( docstring ) {

		return extractRSTStrings( /:rtype\s*([\S]*):\s*([^:]*)\s*:?/g, docstring );

	},

	required: function( docstring ) {

		return extractValue( /required:\s*([\s\S]*)\s*result:/.exec( docstring ) );

	},
	result: function( docstring ) {

		return extractValue( /result:\s*([\s\S]*)\s*/.exec( docstring ) );

	},
	introduction: function( docstring ) {

		return extractValue( /(^[\s\S]*?)(?=required:|result:|:image|$)/.exec( docstring ) );

	},
	images: function( docstring ) {

		return extractRSTStrings( /:image\s*([\S]*):\s*([^:]*)\s*:?/g, docstring, encodeImageString );

	}
};

function extractValue( value ) {

	return utilities.nullableWithDefault( 
		value, 
		function( x ) { return x[1].split('\n').map( function( x ) {return x.trim();} ).filter( nonempty ); }, 
		null 
	);
}

function encodeImageString( name ) {
	return name.replace(/\./g, dotPlaceholder ).replace(/\//g, slashPlaceholder );
}

function extractRSTStrings( pattern, string, keytransform ) {

		keytransform = keytransform || function( x ) { return x; }

		var 	results = {},
			match;

		while ( (match = pattern.exec( string ) ) !== null ) {

			if ( match[1] === "" ) {

				results = match[ 2 ];

			} else {

				results[ keytransform( match[ 1 ] ) ] = match[ 2 ];

			}

		}

		return results;

}






