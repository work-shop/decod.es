"use strict";

var match = require('../../../Match');

var concat = require('../../../Util').concat;

var compose = require('../../../Util').compose;

var not = require('../../../Util').not;

var ignorelist = [ "True", "False", "None", "VERBOSE_FS" ];



module.exports = {
	classes: compose( count, collectClassNames ),
	functions: compose( count, collectFunctionNames ),
};


function count( entries ) {
	var refs = {};

	entries.forEach( function( entry ) {
		if ( typeof refs[ entry ] === "undefined" ) {
			refs[ entry ] = 1;
		} else {
			refs[ entry ] = refs[ entry ] + 1;
		}
	});

	return refs;
}



function collectClassNames( ast ) {

	if ( typeof ast === "undefined" ) return [];

	var collected = [];

	match(
		ast,
		[
			match.expr( match.matchtype('Name'),
				function() {
					collected = collected.concat( [ ast.value ] );
				}
			),
			match.expr( match.matchtype('ClassDef'), 
				function() {
					collected = collected.concat(
						[ ast.name ], 
						ast.bases.map( collectClassNames ).reduce( concat, []),
						ast.decorator_list.map( collectClassNames ).reduce( concat, []),
						ast.body.map( collectClassNames ).reduce( concat, [])
					);
				}
			),
			match.expr( match.otherwise,
				function() {

					for ( var key in ast ) {
						if ( ast.hasOwnProperty( key ) ) {
							if ( isArray( ast[ key ] ) ) {

								collected = collected.concat( ast[key].map( collectClassNames ).reduce( concat, [] ) );

							} else if ( isASTNode( ast[key] ) ) {

								collected = collected.concat( collectClassNames( ast[ key ] ) );

							}
						}
					}
				}
			)
		]
	);

	return collected.filter( isClassName );
}





function collectCallSubexpression( ast ) {

	if ( typeof ast === "undefined" ) return [];

	if ( typeof ast === "string" ) return [ ast ];

	var collected = [];

	match(
		ast,
		[
			match.expr( match.matchtype('Attribute'),
				function() {
					collected = collected.concat( 
						collectCallSubexpression( ast.value ),
						collectCallSubexpression( ast.Attribute )
					);
				}
			),
			match.expr( match.matchtype('Name'),
				function() {
					collected = collected.concat( collectCallSubexpression( ast.value ) );
				}
			),
			match.expr( match.matchtype('Subscript'),
				function() {
					collected = collected.concat( collectCallSubexpression( ast.value ) );
				}
			),
			match.expr( match.otherwise,
				function() {
					for ( var key in ast ) {
						if ( ast.hasOwnProperty( key ) ) {
							if ( isArray( ast[ key ] ) ) {

								collected = collected.concat( ast[key].map( collectCallSubexpression ).reduce( concat, [] ) );

							}
						}
					}
				} 
			) 
		]
	);

	return collected.filter( isFunctionName );

}


function collectFunctionNames( ast ) {

	if ( typeof ast === "undefined" ) return [];

	var collected = [];

	match(
		ast,
		[
			match.expr( match.matchtype('FunctionDef'),
				function() {
					collected = collected.concat(
						[ ast.name ],
						ast.body.map( collectFunctionNames ).reduce( concat, [] )
					);
				}
			),
			match.expr( match.matchtype('Call'),
				function() {
					collected = collected.concat( [ collectCallSubexpression( ast['function']) ] );
				}
			),
			match.expr( match.matchtype('arg'),
				function() {
					collected = collected.concat( [ ast.arg ] );
				}
			),
			match.expr( match.otherwise,
				function() {

					for ( var key in ast ) {
						if ( ast.hasOwnProperty( key ) ) {
							if ( isArray( ast[ key ] ) ) {

								collected = collected.concat( ast[key].map( collectFunctionNames ).reduce( concat, [] ) );

							} else if ( isASTNode( ast[key] ) ) {

								collected = collected.concat( collectFunctionNames( ast[ key ] ) );

							}
						}
					}
				}
			)
		]
	);

	return collected.filter( isFunctionName );

}

function otherwise() {

}


function isArray( object ) {
	return 	Array.isArray( object );
}

function isASTNode( object ) {
	return 	object !== null && 
			typeof object.expr !== "undefined" && 
			typeof object.type !== "undefined";
}

function isFunctionName( string ) {
	return 	typeof string === "string" &&
			string !== "" && 
			!ignorelist.some( function( entry ) { return entry === string; }) &&
			string[ 0 ] === string[ 0 ].toLowerCase();	
}

function isClassName( string ) {
	return 	typeof string === "string" &&
			string !== "" && 
			!ignorelist.some( function( entry ) { return entry === string; }) &&
			string[ 0 ] === string[ 0 ].toUpperCase();

}






