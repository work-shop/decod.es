"use strict";

var baseset = require('./Ruleset' );

function Rules( args, ruleset ) {

	if ( typeof ruleset === "undefined") ruleset = baseset( args );
	
	var RuleTester = function( filepath, ast ) {

		return ruleset.reduce( function( result, rule ) {

			return ( result !== false ) ? result : rule.test( filepath, ast ); 

		}, false );

	};

	return RuleTester;
}

module.exports = Rules;