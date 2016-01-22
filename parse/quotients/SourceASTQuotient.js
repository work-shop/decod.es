"use strict";

var fs = require('fs');

var path = require( 'path' );

var utilities = require('../../Util');

var match = require('../../Match');

var prune = require('./operations/PruneQuotient');

var canonicalize = require('./operations/CanonicalizeResource');

var references = require('./operations/CollectReferences');

/**
 * Given a full filepath and an AST representing the contents of
 * that filepath, a quotient term return a collapses the AST according
 * to a given ruleset, and returns a quotient object – the AST appropriately
 * "requoted" – along with a path to seat that object at in the overarching
 * JSON structure.
 *
 * The SourceASTQuotient collapses a file according to its code definitions.
 * 
 * @param  {[type]} filepath [description]
 * @param  {[type]} ast      [description]
 * @return {[type]}          [description]
 */
module.exports = function( args ) {

	return function sourceASTQuotient( filepath, ast ) {
		var file = fs.readFileSync( filepath, 'utf8' ).split('\n');

		/**
		 * The divide routine takes an object assumed to have
		 * a .type property containing a String. The TypeDivision
		 * of this object 
		 * @param {[type]} object [description]
		 * @param {[type]} key    [description]
		 */
		function divideAST( ast ) {
			var quotient = {};

			match(
				ast,
				[
					match.expr( match.matchtype( 'FunctionDef' ),
						function() {

							quotient.name = ast.name;

							if ( typeof ast.decorators !== "undefined" ) { 

								quotient.decorators = ast.decorators.map( function( x ) { return x.line; } ).filter( function( x ) { return typeof x !== "undefined"; }); 

							}

							
							quotient.documentation = ast.docstring;
								
							quotient.start = ast.position.line;

							quotient.end = closingLineFromAST( ast );

							quotient.code = false;

							quotient.code = file.slice( quotient.start, quotient.end + 1 );
							
						}),

					match.expr( match.matchtype( 'ClassDef' ),
						function() {

							quotient.name = ast.name;

							quotient.definedIn = filepath;

							
							quotient.documentation = ast.docstring;
														

							if ( typeof ast.decorators !== "undefined" && ast.decorators.length > 0 ) { 
							
								quotient.decorators = ast.decorators.map( function( x ) { return x.line; } ).filter( function( x ) { return typeof x !== "undefined"; }); 

							}

							quotient.references = {
								classes: references.classes( ast ),
								functions: references.functions( ast )
							};

							quotient.definitions = ast.body.map( divideAST ).filter( function( x ) { return x !== null; } );
							
							quotient.start = ast.position.line;

							quotient.end = closingLineFromQuotient( quotient );

						}),

					match.expr( match.matchtype( 'Module' ),
						function() {

							quotient.definedIn = filepath;
							quotient.start = ast.position.line;
							quotient.end = closingLineFromQuotient( quotient );

							if ( ast.docstring !== null ) {

								quotient.documentation = ast.docstring;
								
							}

							quotient.definitions = ast.body.map( divideAST ).filter( function( x ) { return x !== null; } );
							
						}),

					match.expr( match.otherwise, function( ) { quotient = null; } )
				]
			);

			return quotient;
		}
			

		function prefixPath( filepath ) {

			var parsed = path.parse( filepath ).dir;

			var baseIndex = parsed.indexOf( args.base_name );

			if ( baseIndex !== -1 ) {

				parsed = parsed.substring( parsed.indexOf( args.base_name ) + args.base_name.length );

			}

			return  parsed.split( path.sep ).filter( function( component ) { return component !== ''; } );

		}


		var prefixes = prefixPath( filepath );

		var division = prune( divideAST( ast ) );

		return division.definitions.map( function( quotient ) {
			/**
			 * This definition
			 */
			//console.log( quotient );
			return [
				{ 
					filepath: utilities.prune( args.source, filepath), 
					schema: canonicalize( ['schema'].concat(prefixes).concat( [quotient.name] ) ),
					content: canonicalize( ['content'] ),
					value: quotient
				}
			];

			//return [{ filepath: filepath, prefixes: prefix, value: quotient }];

		}).reduce( function (a,b) { return a.concat(b); }, []);
	};
};


/**
 * given an AST quotient structure, this method produces
 * the last line in the corresponding sourcefile where
 * that the structure ranges over
 * 
 * @param  {JSON} quotient a Source Quotient object
 * @return {Number}         a file line number
 */
function closingLineFromQuotient( quotient ) {

	if ( typeof quotient.end !== "undefined" ) {

		return quotient.end;

	} else if ( typeof quotient.definitions !== "undefined" && quotient.definitions.length ) {

		return closingLineFromQuotient( quotient.definitions[ quotient.definitions.length - 1 ] );

	} else {

		return quotient.start;

	}

}

/**
 * given an AST structure, this routine produces a number
 * representing the extent of a file that that AST structure
 * ranges over 
 * 
 * @param  {JSONAST} ast the ast to check
 * @return {Number}     the last line on which the AST is defined
 */
function closingLineFromAST( ast ) {

	if ( typeof ast.body !== "undefined" ) {
  
		return closingLineFromAST( ast.body[ ast.body.length - 1 ] );

	} else {

		return ast.position.line;

	}

}

