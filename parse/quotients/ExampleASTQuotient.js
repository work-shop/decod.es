"use strict";

var fs = require('fs');

var path = require( 'path' );

var match = require('../../Match');

module.exports = function( args ) {
	return function exampleASTQuotient( filepath, ast ) {
		var file = fs.readFileSync( filepath, 'utf8' ).split('\n');

		function determineStartLine( endLine ) {
			if ( endLine > 0 ) {
				var delimiter = file[ endLine - 1 ].trim();
				var startLine = endLine - 2;

				while ( file[ startLine ].trim() !== delimiter ) { 
					startLine -= 1; 
				}
				
				return startLine + 1;

			}

			return 0;
		}


		function prefixPath( filepath ) {

			var parsed = path.parse( filepath ).dir;

			var baseIndex = parsed.indexOf( args.base_name );

			if ( baseIndex !== -1 ) {

				parsed = parsed.substring( parsed.indexOf( args.base_name ) + args.base_name.length );

			}

			return parsed.split( path.sep ).filter( function( component ) { return component !== ''; } );

		}


		function tagAST( ast ) {
			var quotient = {};

			match(
				ast,
				[
					match.expr( match.matchtype( 'Module' ),
						function() {

							quotient.documentation = ast.docstring;
							quotient.blocks = ast.body.map( tagAST ).filter( function( x ) { return x !== null; });

						}),
					match.expr( match.matchtype('Expr'),
						function() {

							if ( match.matchtype('String')( ast.value ) ) {

								quotient.description = ast.value.value;
								quotient.start = determineStartLine( ast.value.position.line );
								quotient.end = ast.value.position.line;
								quotient.code = {};

							} else {

								quotient = null;

							}

						}),
					match.expr( match.otherwise, function() {
						quotient = null; 
					} )
				]
			);

			return quotient;
		}

		function condenseQuotient( quotient ) {
			var blocks = [];

			for ( var i = 1; i < quotient.blocks.length; i++ ) {

				var thisBlock = quotient.blocks[ i ];
				var nextBlock = quotient.blocks[ i + 1 ];

				if ( typeof nextBlock !== "undefined" ) {

					thisBlock.code.start = thisBlock.end;
					thisBlock.code.end = nextBlock.start - 1;

					thisBlock.code.content = file.slice( thisBlock.code.start, nextBlock.start );

				} else {

					thisBlock.code.start = thisBlock.end;
					thisBlock.code.end = file.length - 1;

					thisBlock.code.content = file.slice( thisBlock.code.start );

				}

				blocks.push( thisBlock );
			}

			quotient.blocks = blocks;

			return quotient;
		}

		var condensed = condenseQuotient( tagAST( ast ) );

		var prefixes = prefixPath( filepath );

		return [{ prefixes: prefixes, value: condensed }];
	};
};





