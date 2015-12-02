"use strict";


var PythonProcess = require('../processes/PythonProcess');

var SkipProcess = require('../processes/SkipProcess' );


var emptyQuotient = require('../quotients/EmptyQuotient' );

var exampleASTQuotient = require('../quotients/ExampleASTQuotient' );

var sourceASTQuotient = require('../quotients/SourceASTQuotient' );

var compose = require( '../compositions/ComposeProcessQuotient' );


var Rule = require('./Rule');


var 	and = Rule.and, 
	
	or = Rule.or,

	not = Rule.not,
	
	contains = Rule.contains, 

	within = Rule.within;





module.exports = function( args ) {

	var 	skip = compose( args )( SkipProcess, emptyQuotient ),

		source = compose( args )( PythonProcess, sourceASTQuotient ),

		example = compose( args )( PythonProcess, exampleASTQuotient );


	return [

		new Rule().when( contains('.DS_Store') ).preform( skip ),

		new Rule().when( within('problems') ).preform( skip ),

		new Rule().when( and( contains('.py'), or( within('test', 'test'), within('test', 'io') ) ) ).preform( skip ),

		new Rule().when( and( within( 'source' ), contains('.py') ) ).preform( source  ),

		new Rule().when( and( within('examples'), contains('.py') ) ).preform( example )

	];

};