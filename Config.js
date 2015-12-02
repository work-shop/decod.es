"use strict";

var fs = require('fs');

var path = require('path');

var ArgumentParser = require('argparse').ArgumentParser;

var Package = JSON.parse( fs.readFileSync('./package.json') );

var firebaseURL = "https://incandescent-torch-1447.firebaseio.com/";

var parserURL = path.join( __dirname, '..', 'decod.es-parser' );

var tempateDir = path.join( process.cwd(), 'templates' );

var baseName = 'decodes';





var parser = new ArgumentParser({
	version: Package.version,
	addHelp: true,
	description: Package.description
});

var subparsers = parser.addSubparsers({
	title: "subcommands",
	dest: "subcommand"
});

var parse = subparsers.addParser('parse', { addHelp: true});

	parse.addArgument(
		['source'],
		{	
			help: 'Specify the filestructure to parse',
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

	parse.addArgument(
		[ '-b', '--base-name'],
		{
			help: 'Specify a directory base-name to reduce filepaths against in parsing.',
			defaultValue: baseName
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
		['-f', '--firebase'],
		{
			help: 'Specify the source firebase to pull the source data from.',
			defaultValue: firebaseURL
		}
	);


/**
 * The serve flag tells the system to launch
 * a local server which serves the decod.es 
 * documentation app.
 */
var serve = subparsers.addParser('serve', { addHelp: true });

	/**
	 * The port argument overrides the default port
	 * to bind to when launching a local server.
	 */
	serve.addArgument(
		[ '-p', '--port' ],
		{
			help: 'Specify the port to bind the local server to.',
			defaultValue: 8000
		}
	);


parser.addArgument(
	['-q', '--quiet'],
	{
		help: 'Just present the minimal output report, at the end of parsing.',
		defaultValue: false
	}
);

parser.addArgument(
	['-s', '--silent'],
	{
		help: 'Produce no output at all, except on an error condition.',
		defaultValue: false
	}
);


module.exports = parser.parseArgs();