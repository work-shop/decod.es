"use strict";

var emptyQuotient = require('../quotients/EmptyQuotient' );

var exampleASTQuotient = require('../quotients/ExampleASTQuotient' );

var sourceASTQuotient = require('../quotients/SourceASTQuotient' );

var Rule = require('./Rule');

var 	and = Rule.and, 
	
	or = Rule.or,
	
	contains = Rule.contains, 

	within = Rule.within;


module.exports = function( args ) {

	console.log( contains('.DS_Store')( '/Users/nicschumann/Work-Space/decod.es/test/.DS_Store'  ) );

	return [

		new Rule().when( contains('.DS_Store') ).preform( emptyQuotient( args ) ),

		new Rule().when( and( contains('.py'), or( within('test', 'test'), within('test', 'io') ) ) ).preform( emptyQuotient( args ) ),

		new Rule().when( and( within( 'source' ), contains('.py') ) ).preform( sourceASTQuotient( args ) ),

		new Rule().when( and( within('examples'), contains('.py') ) ).preform( exampleASTQuotient( args ) )

	];

};