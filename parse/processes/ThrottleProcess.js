"use strict";

/**
 * The maximum numbers of interwoven processes.
 * 
 * @type {Number}
 */
var limit = 5;

/**
 * The number of currently active processes
 * 
 * @type {Number}
 */
var running = 0;

/**
 * The queue of processes awaiting execution.
 * Empty, initially.
 * 
 * @type {[Process]}
 */
var queue = [];

/**
 * The ThrottleProcess transformer takes a subprocess and returns
 * a new process that is constrained to only have limit instances
 * running at a given instant. This is global throttle on all throttled processes.
 * 
 * @param  {Process} Subprocess a childprocess to govern.
 * @return {Process}            a throttled version of subprocess.
 */
module.exports = function ( Subprocess ) {
	return function ( args ) {
		return function ThrottleProcess( filepath, log ) {
			if ( !( this instanceof ThrottleProcess ) ) { return new ThrottleProcess( filepath, log ); }
			var self = this;

			/**
			 * The a wrapper around the subprocess' run method.
			 * 
			 * @param  {Quotient}   transform a quotient to pass to the subprocess.
			 * @param  {Function} done      a callback to pass to the subprocess
			 */
			self.run = function( transform, done ) {

				if ( running < limit ) {

					running += 1;

					(new Subprocess( args )( filepath, log )).run( transform, 
						function( ) {

							running -= 1;

							if ( queue.length ) queue.pop()();
							
							done.apply( self, arguments );

						} 
					);


				} else {

					queue.push( function() { self.run( transform, done ); } );

				}
			};
		};
	};
};