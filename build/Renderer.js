"use strict";

var util = require('util');

var url = require('url');

var path = require('path');

var fs = require( 'fs-extra' );

var swig = require('swig');

var async = require('async');


var excludedKeys = ['_url', '_name', '_id', '_timestamp']

var overloadedFor = require('./extensions/For')( excludedKeys );

var utilities = require('../Util');

var unencodeImage = require('./extensions/InvertImageEncoding');


var individual = "children";

var index = "index";

var suffix = ".html";

var defaultRedirect = "/";


swig.setTag('for', overloadedFor.parse, overloadedFor.compile, overloadedFor.ends );

swig.setFilter( 'array', require('./extensions/Array')( excludedKeys ) );

swig.setFilter( 'size', require('./extensions/Size')( excludedKeys ) );

swig.setFilter( 'pluralize', require('./extensions/Pluralize')( ) );

swig.setFilter( 'rest', require('./extensions/Rest')( ) );


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

                            console.log( err.stack );

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

		function asset( image ) {
			return url.resolve( args.image_cdn, unencodeImage( image ) );
		}

        function exampleReferences( examples ) {

            var references = {};

            for ( var exampleName in examples ) {
                if ( examples.hasOwnProperty( exampleName ) && excludedKeys.indexOf( exampleName ) === -1 ) {
                    if ( typeof examples[exampleName].references !== "undefined" && typeof examples[exampleName].references.classes !== "undefined") {
                        var exampleSectionReferences = examples[exampleName].references.classes;

                        for ( var referenceName in exampleSectionReferences ) {
                            if ( exampleSectionReferences.hasOwnProperty( referenceName ) && lookup( referenceName ) !== defaultRedirect ) {
                                if ( typeof references[ referenceName ] !== "undefined" ) {
                                    references[ referenceName ] += exampleSectionReferences[ referenceName ];
                                } else {
                                    references[ referenceName ] = exampleSectionReferences[ referenceName ];
                                }
                            }
                        }
                    }
                }
            }

            return references;
        }

        function convertFilename( name ) {
            return path.parse( name ).name;
        }

        function sortByKey( key, objects ) {
            var files = { constructor: [] };

            for ( var objectName in objects ) {
                if ( objects.hasOwnProperty( objectName ) && excludedKeys.indexOf( objectName ) === -1 ) {
                    if ( typeof objects[ objectName ][ key ] !== "undefined" ) {
                        if ( typeof files[ objects[ objectName ][ key ] ] === "undefined" ) {
                            files[ objects[ objectName ][ key ] ] = [ objects[ objectName ] ];
                        } else {
                            files[ objects[ objectName ][ key ] ].push( objects[ objectName ] );
                        }
                    }
                }
            }

            return files;

        }

		function lookup( string ) {
			if ( typeof nametable[ string ] !== "undefined" ) {
				return "/" + nametable[ string ];
			} else {
				return defaultRedirect;
			}
		}

        function extractExampleImages( item ) {
            var images = {};

            for ( var exampleName in item ) {
                if ( item.hasOwnProperty( exampleName ) && excludedKeys.indexOf( exampleName ) === -1 ) {
                    if ( typeof item[ exampleName ].documentation !== "undefined" && typeof item[ exampleName ].documentation.images !== "undefined" ) {

                        for ( var imageName in item[ exampleName ].documentation.images ) {

                            if ( item[ exampleName ].documentation.images.hasOwnProperty( imageName ) ) {
                                images[ imageName ] = item[ exampleName ].documentation.images[ imageName ];
                            }
                        }
                    }
                }
            }

            return images;

        }

		function title( name ) {
			return name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/(\b.)+/g, function( x ) { return x.toUpperCase(); } ).trim();
		}

		function condense( name ) {
			var uppers = name.split('').filter( function( x ) { return x.toUpperCase() === x; } ).join('');

			return (uppers.length > 1) ? uppers.substring(0,3) : name.substring(0,3);
		}

		function resolve( string, references ) {
			if ( typeof references === "undefined" ) {
				references = nametable;
			} else {
				references = references.classes;
			}

            if ( typeof string === "undefined" ) { return string; }

			for ( var object in references ) {
				if ( references.hasOwnProperty( object ) ) {

					string = string.replace(
						new RegExp( object, "g" ),
						"<a href=\""+ lookup( object ) +"\">"+object+"</a>"
					);

				}

			}

			return string;
		}

        function extractDocumentedMethods( doc ) {

            return (doc.definitions || []).filter( function( method ) {

                return  (typeof method.documentation !== "undefined") &&
                        (typeof method.documentation.description !== "undefined" && method.documentation.description[0] !== "null" ) &&
                        ((typeof method.documentation.parameters !== "undefined" && typeof method.documentation.types !== "undefined" ) ||
                         (typeof method.documentation.rvalue !== "undefined" && typeof method.documentation.rtype !== "undefined" ));


            });

        }

		context.url = function( item ) {
			return item._url;
		};

		context.name = function( item ) {
			return item._name;
		};

        context.convertFilename = convertFilename;

        context.sortByKey = sortByKey;

		context.resolve = resolve;

		context.lookup = lookup;

		context.asset = asset;

		context.condense = condense;

		context.title = title;

        context.exampleReferences = exampleReferences;

        context.extractExampleImages = extractExampleImages;

        context.extractDocumentedMethods = extractDocumentedMethods;

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
