"use strict";

var utilities = require('../../../Util');

var nonempty = utilities.compose( utilities.not, utilities.empty );

module.exports = {
	required: function( docstring ) {

		var execResult = /required:\s*([\s\S]*)\s*result:/.exec( docstring );

		return extractValue( execResult );

	},
	result: function( docstring ) {

		return extractValue( /result:\s*([\s\S]*)\s*/.exec( docstring ) );

	},
	introduction: function( docstring ) {

		return extractValue( /\s*([\s\S]*)\s*required:/.exec( docstring ) );

	}
};

function extractValue( value ) {

	//console.log( value );

	return utilities.nullableWithDefault( 
		value, 
		function( x ) { return x[1].split('\n').map( function( x ) {return x.trim();} ).filter( nonempty ); }, 
		null 
	);
}