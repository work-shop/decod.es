"use strict";

var util = require('util');

var path = require('path');

var fs = require( 'fs-extra' );

var swig = require('swig');

var async = require('async');



var overloadedFor = require('./extensions/For')(['_url', '_name', '_id', '_timestamp']);

var utilities = require('../Util');

var canonicalize = require('../route/CanonicalizeRoute');



var individual = "children";

var index = "index";

var suffix = ".html";

var defaultRedirect = "/";

var memo = {};



swig.setTag('for', overloadedFor.parse, overloadedFor.compile, overloadedFor.ends );



module.exports = function Renderer( args ) {



	swig.setDefaults({ loader: swig.loaders.fs( args.templates ) });

	if ( !(this instanceof Renderer ) ) { return new Renderer( args ); }
	var self = this;

	self.render = function( path, context, log, nametable, continuation ) {
		
		async.filterSeries( resolveTemplatePaths( path ), fs.exists,  function( existing ) {

			var outputLocation = resolveOutputPath( path );

			if ( existing.length > 0 ) {

				var templateLocation = existing[ 0 ];

				fs.ensureFile( outputLocation, function ( err ) {
					if ( err ) {

						log.addLine( 
							utilities.prune( args.templates, templateLocation ),  
							utilities.prune( args.destination, outputLocation ),
							"IO",
							err.message,
							Date.now()
						);

						continuation();

					} else {

						try {

							fs.writeFile( 

								outputLocation, 
								swig.compileFile( templateLocation )( buildContext( context, nametable ) ), 
								{ flags: "w" },
								function( err ) {

									if ( err ) {

										log.addLine( 
											utilities.prune( args.templates, templateLocation ),  
											utilities.prune( args.destination, outputLocation ),
											"IO",
											err.message,
											Date.now()
										);

									} else {

										log.addLine( 
											utilities.prune( args.templates, templateLocation ),  
											utilities.prune( args.destination, outputLocation ),
											"OK",
											"",
											Date.now()
										);

									}

									continuation();
								}

							);

						} catch ( err ) {

							log.addLine( 
								utilities.prune( args.templates, templateLocation ),  
								utilities.prune( args.destination, outputLocation ),
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
					utilities.prune( args.destination, outputLocation ),
					"Skipped",
					"No Template Specified!",
					Date.now()
				);

				continuation();

			}

		});

	};

	/**
	 * given a schema path to render, this routine returns the path, based at args.templates
	 * that should be used to render this file.
	 * 
	 * @param  {[type]} path [description]
	 * @return {[type]}      [description]
	 */
	function resolveTemplatePaths( pathComponents ) {

		var templates = [];

		for (var i = pathComponents.length - 1; i >= 0; i-- ) {

			templates.unshift(
				path.join( 
					args.templates, 
					pathComponents.slice( 0, i ).join( path.sep ), 
					utilities.repeat( individual, pathComponents.length - i ).join('.') + suffix )
			);

		}

		templates.unshift( path.join( args.templates, pathComponents.join( path.sep ), index + suffix ) );

		return templates;		

	}

	/**
	 * This function builds a rendering context that is 
	 * specific to the particular object being rendered.
	 * 
	 * @param  {[type]} context [description]
	 * @return {[type]}         [description]
	 */
	function buildContext( context, nametable ) {

		//var lookup = lookupIn( context );
		//
		function lookup( string ) {
			if ( typeof nametable[ string ] !== "undefined" ) {
				return "/" + nametable[ string ];
			} else {
				return defaultRedirect;
			}
		}

		function resolve( string, references ) {

			for ( var object in references.classes ) {
				if ( references.classes.hasOwnProperty( object ) ) {

					string = string.replace( 
						new RegExp( object, "g" ), 
						"<a href=\""+ lookup( object ) +"\">"+object+"</a>" 
					);

				}

			}


			return string;
		}
		
		context.url = function( item ) {
			return item._url;
		};

		context.name = function( item ) {
			return item._name;
		};

		context.resolve = resolve;

		context.lookup = lookup;

		return context;
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

};





