"use strict";

var baseset = require('./Ruleset' );

function Rules( args, ruleset ) {

	if ( typeof ruleset === "undefined") ruleset = baseset( args );
	
	var RuleTester = function( filename, log, done ) {

		return ruleset.reduce( function( result, rule ) {

			return ( result !== false ) ? result : rule.test( filename, log, done ); 

		}, false );

	};

	return RuleTester;
}

module.exports = Rules;