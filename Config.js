"use strict";

var fs = require('fs');

var path = require('path');

var ArgumentParser = require('argparse').ArgumentParser;

var Package = JSON.parse( fs.readFileSync('./package.json') );

var firebaseURL = "https://incandescent-torch-1447.firebaseio.com/";

var gitBaseUrl = "https://github.com/ksteinfe/decodes/blob/master/";

var parserURL = path.join( __dirname, '..', 'decodes-parser' );

var tempateDir = path.join( process.cwd(), 'static' );

var baseName = 'test';

var baseOutput = 'db.json';





var parser = new ArgumentParser({
	version: Package.version,
	addHelp: true,
	description: Package.description
});

var subparsers = parser.addSubparsers({
	title: "subcommands",
	dest: "subcommand"
});

var parse = subparsers.addParser('parse', { addHelp: true });

	parse.addArgument(
		['source'],
		{	
			help: 'Specify the filestructure to parse',
		}
	);

	/**
	 * The dump command tells the parse process to ignore 
	 * the firebase, and instead just dump the parse resultant
	 * to STDOUT. 
	 */
	parse.addArgument(
		['-d', '--dump'],
		{
			help: 'Ignore the firebase and dump the resultant to STDOUT.',
			defaultValue: false
		}
	);

	/**
	 * The parse command tells the system to read a 
	 * specified filestructure, parse the required data from
	 * it, and store the results in the specified firebase.
	 */
	parse.addArgument(
		['-f', '--firebase'],
		{
			help: 'Specify the destination firebase to store the parsed data in.',
			defaultValue: firebaseURL
		}
	);

	/**
	 * The parse command tells the system to use the
	 * parse tool located at the specified location
	 */
	parse.addArgument(
		['-t', '--parse-tool'],
		{
			help: 'Specify the location of the Python AST Parser to use in the parse process.',
			defaultValue: parserURL
		}
	);

	/**
	 * The base name command gives a system-specific prefix to
	 * elide from the posted JSON.
	 */
	parse.addArgument(
		[ '-b', '--base-name'],
		{
			help: 'Specify a path prefix to elide from the parse resultant. Useful for removing a common prefix from all files.',
			defaultValue: baseName
		}
	);

	parse.addArgument(
		['-o', '--outfile'],
		{
			help: 'Specify a file to dump parse output in. The file will be overwritten, if it exists.',
			nargs: 1,
			defaultValue: baseOutput

		}
	);

	parse.addArgument(
		['-g', '--giturl'],
		{
			help: "Specify the base giturl that is this collection of files lives on.",
			defaultValue: gitBaseUrl
		}
	);


/**
 * The build flag tells the system to
 * read the remote datastore and build
 * the templates representing the decodes codebase
 */
var build = subparsers.addParser('build', { addHelp: true });

	build.addArgument(
		["destination"],
		{
			help: 'Specify the destination to write the rendered files to',
		}
	);

	/**
	 * This build flag specifies an alternative template
	 * directory to use.
	 *  
	 * @type {String}
	 */
	build.addArgument(
		['-t', '--templates' ],
		{
			help: 'Specify a set of swig templates to pull from when constructing the output.',
			defaultValue: tempateDir
		}
	);

	build.addArgument(
		['-w','--watch'],
		{	
			action: "storeTrue",
			help: 'Set the build process to run as a server, listening to the specified firebase url for changes',
			defaultValue: false
		}
	);

	build.addArgument(
		['-i', '--infile' ],
		{
			help: 'Read a parsefile to build the site.',
			nargs: 1
		}
	);

	build.addArgument(
		['-f', '--firebase'],
		{
			help: 'Specify the source firebase to pull the source data from.',
			defaultValue: firebaseURL
		}
	);


module.exports = parser.parseArgs();