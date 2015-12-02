"use strict";

module.exports = function( args ) {
	return function SkipProcess( filename, log ) {
		if ( !(this instanceof SkipProcess) ) { return new SkipProcess( filename, log ); }
		var self = this;

		/**
		 * The Process using method curries out the transform
		 * for this process, allowing it to be baked into the Process,
		 * and then returns a function that binds the remaining
		 * data required for a given Process. This is an internal composition
		 * 
		 * @param  {Quotient} transform [description]
		 * @return {String -> Log -> (err, result -> void)}  [description]
		 */
		self.using = function( transform ) {
			return function ( filepath, log, done ) {

				(new SkipProcess( filepath, log )).run( transform, done );

			};
		};

		self.run = function( transform, done ) {

			log.lock( function( methods ) {

				methods.record( Date.now(), filename, undefined, "Skipped");

			});

			done();

		};

	};
};