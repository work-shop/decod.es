"use strict";

var util = require( 'util' );

var path = require('path');

var fs = require( 'fs-extra' );

var swig = require('swig');

var async = require('async');

var individual = "individual.html";

var index = "index.html";

var Color = require('cli-color');

var overloadedFor = require('./extensions/For')(['_url', '_name', '_id', '_timestamp']);

swig.setTag('for', overloadedFor.parse, overloadedFor.compile, overloadedFor.ends );

module.exports = function Renderer( args ) {

	swig.setDefaults({ loader: swig.loaders.fs( args.templates ) });

	if ( !(this instanceof Renderer ) ) { return new Renderer( args ); }
	var self = this;

	self.render = function( path, context, log, continuation ) {
		
		async.filterSeries( resolveTemplatePaths( path ), fs.exists,  function( existing ) {

			var outputLocation = resolveOutputPath( path );

			if ( existing.length > 0 ) {

				var templateLocation = existing[ 0 ];

				

				fs.ensureFile( outputLocation, function ( err ) {
					if ( err ) {

						console.log('error with ensureFile');

						log.addLine( 
							prune( args.templates, templateLocation ),  
							prune( args.destination, outputLocation ),
							"IO",
							err.message,
							Date.now()
						);

						continuation();

					} else {

						try {

							fs.writeFile( 

								outputLocation, 
								swig.compileFile( templateLocation )( buildContext( context ) ), 
								{ flags: "w" },
								function( err ) {

									if ( err ) {

										console.log( 'error' + err.message );

										log.addLine( 
											prune( args.templates, templateLocation ),  
											prune( args.destination, outputLocation ),
											"IO",
											err.message,
											Date.now()
										);

									} else {

										console.log( 'done!' );

										log.addLine( 
											prune( args.templates, templateLocation ),  
											prune( args.destination, outputLocation ),
											"OK",
											"",
											Date.now()
										);

									}

									continuation();
								}

							);

						} catch ( err ) {

							console.log('error'); 

							log.addLine( 
								prune( args.templates, templateLocation ),  
								prune( args.destination, outputLocation ),
								"Template",
								err.message,
								Date.now()
							);

							continuation();

						}

					}

				});

			} else {

				log.addLine( 
					"",  
					prune( args.destination, outputLocation ),
					"Template",
					"No Template Specified!",
					Date.now()
				);

				continuation();

			}

		});

	};

	/**
	 * given a schema path to render, this routine returns the relative url for the resulting
	 * webpage.
	 * 
	 * @param  {[type]} path [description]
	 * @return {[type]}      [description]
	 */
	function resolveUrl( pathComponents ) {

		return '/' + pathComponents.join( '/' );

	}

	/**
	 * given a schema path to render, this routine returns the path, based at args.templates
	 * that should be used to render this file.
	 * 
	 * @param  {[type]} path [description]
	 * @return {[type]}      [description]
	 */
	function resolveTemplatePaths( pathComponents ) {

		if ( pathComponents.length === 0 ) {

			return [ path.join( args.templates, 'index.html' ) ];

		} else {

			return [ 
				path.join( args.templates, pathComponents.join( path.sep ), index ),
				path.join( args.templates, pathComponents.slice(0, pathComponents.length - 1 ).join( path.sep ), individual ),
			];

		}

		

	}

	/**
	 * given a schema path to render, this routine returns the destination, based at args.output
	 * that should be used as the destination location for this file.
	 * 
	 * @param  {[type]} path [description]
	 * @return {[type]}      [description]
	 */
	function resolveOutputPath( pathComponents ) {

		return path.join( args.destination, pathComponents.join( path.sep ), 'index.html' );

	}

	function prune( subpath, superpath ) {
		var keep = last( subpath.split( path.sep ) );

		return keep + superpath.substring( subpath.length );
	}

	function buildContext( context ) {
		context.url = function( item ) {
			return item._url;
		};

		context.name = function( item ) {
			return item._name;
		};

		return context;
	}

};

function last( arr ) {
	return arr[ arr.length - 1 ];
}

