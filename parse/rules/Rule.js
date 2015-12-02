"use strict";

var sep = require('path').sep;

function Rule() {
	if (! (this instanceof Rule) ) { return new Rule(); }
	var self = this;

	var condition = Rule.unit;

	var action = Rule.nothing;

	self.when = function( additional ) {

		condition = additional;

		return self;
	};

	self.preform = function( replacement ) {

		action = replacement;

		return self;
	};

	self.test = function( filepath, ast ) {

		return ( condition( filepath, ast ) ) ? action( filepath, ast ) : false;

	};

}

/**
 * Return the negation of a given test.
 * 
 * @param  {[type]} f [description]
 * @return {[type]}   [description]
 */
Rule.not = function( f ) {
	return function( filepath, ast ) {
		return ! f( filepath, ast );
	};
};

/** Rule Combinators */

/**
 * The Rule.or combinator takes a sequence of boolean-valued functions and returns a function that
 * true if the argument passes at least one of the functions passed to it.
 *
 * @param {[(x -> Bool)]} a sequence of boolean valued test functions.
 * @return {x -> Bool} a function to test the functions on.
 */
Rule.or = function() {
	var parentArguments = arguments;

	return function( filepath, ast ) {
		return Array.apply( null, parentArguments ).reduce( function( b, f ) {
			return b || f( filepath, ast ); 
		}, false);
	};
};

/**
 * The Rule.and combinator takes a sequence of boolean-valued functions and returns a function that
 * true if the argument passes at all the test functions passed to it.
 *
 * @param {[(x -> Bool)]} a sequence of boolean valued test functions.
 * @return {x -> Bool} a function to test the functions on.
 */
Rule.and = function() {
	var parentArguments = arguments;

	return function( filepath, ast ) {
		return Array.apply( null, parentArguments ).reduce( function( b, f ) {
			return b && f( filepath, ast ); 
		}, true);
	};
};

/** Rule Predicates */

/**
 * this simple predicate 
 * @return {[type]} [description]
 */
Rule.contains = function() {

	var test_strings = Array.apply( null, arguments );

	return function ( filepath ) {
		return test_strings.reduce( function(b,a) {
			return b && (filepath.indexOf( a ) !== -1);
		}, true);
	};

};

/**
 * The within predicate checks whether the path contains all of the strings passed, 
 * in the order that they were passed to the predicate. It also ensures that all
 * containment is disjoint containment. This means that the smalles string for which 
 * within('hello', 'ello') would return true for is "helloello". It's useful for checking that
 * a given file sits strictly within a certain filepath that potentially contains wildcards.
 * 
 * @return {[type]} [description]
 */
Rule.within = function() {
	var test_strings = Array.apply( null, arguments );

	return function ( filepath ) {
		return test_strings.reduce( function (b, a) {

			var start = b.test.indexOf( a );

			return { 
				test: ( start !== -1 ) ? b.test.slice( start + 1 ) : b.test, 
				result: b.result && (start !== -1) 
			};

		}, {test: filepath.split( sep ), result: true} ).result;
	};
};

/**
 * Stupid Do Nothing Function.
 * 
 * @param  {[type]} filepath [description]
 * @param  {[type]} ast      [description]
 * @return {[type]}          [description]
 */
Rule.unit = function(  ) { return true; };

/** */
Rule.nothing = function(  ) { return false; };

module.exports = Rule;