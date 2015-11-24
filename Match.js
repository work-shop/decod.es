"use strict";

var util = require('util');

function match( value, actions ) {
	var reduction = actions.reduce( function( b, m ) {
		return ( !b ) ? m( value ) : b;

	}, false ) ;

	if ( reduction ) {
		return reduction( value );
	} else {
		throw new Error("MatchError: Non-exhaustive pattern matching in match, matching for " + util.inspect( value ) );
	}
}

match.expr = function( predicate, continuation ) {
	return function( value ) {
		if ( predicate( value ) ) { return continuation; }
		else { return false; }
	};
};

match.matchtype = function( type ) {
	return function( object ) {
		return object.type === type;
	};
};

match.matchexpr = function( type ) {
	return function( object ) {
		return object.expr === type;
	};
};

match.and = function( arr ) {
	return function( x ) {
		return arr.every( function( f ) {
			return f( x );
		});
	};
};

match.or = function( arr ) {
	return function( x ) {
		return arr.any( function( f ) {
			return f( x );
		});
	};
};

match.otherwise = function(  ) { return true; };

match.nothing = function( ) { };

module.exports = match;