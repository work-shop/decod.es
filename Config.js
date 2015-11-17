"use strict";

var fs = require('fs');

var ArgumentParser = require('argparse').ArgumentParser;
var Package = JSON.parse( fs.readFileSync('./package.json') );


var parser = new ArgumentParser({
	version: Package.version,
	addHelp: true,
	description: Package.description
});

/**
 * The parse command tells the system to read a 
 * specified filestructure, parse the required data from
 * it, and store the results in the specified firebase.
 * @type {String}
 */
parser.addArgument(
	['-p', '--parse'],
	{
		help: 'Parse the given directory structure and store the resulting datestructure for subsequent use.'
	}
);

/**
 * The build flag tells the system to
 * read the remote datastore and build
 * the templates representing the decodes codebase
 * 
 */
parser.addArgument(
	[ '-b', '--build' ],
	{
		help: 'Read the stored datastructure and compile the site\'s templates.'
	}
);

/**
 * The serve flag tells the system to launch
 * a local server which serves the decod.es 
 * documentation app.
 */
parser.addArgument(
	[ '-s', '--serve' ],
	{
		help: 'Launch a local server on the specified port that serves the rendered templates.'
	}
);

/**
 * 
 * @type {String}
 */
parser.addArgument(
	['-f', '--firebase'],
	{
		help: 'Specify the firebase url to use for storing parsed data'
	}
);



module.exports = parser.parseArgs();