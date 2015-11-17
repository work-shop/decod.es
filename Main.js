"use strict";

var args = require('./Config');

switch ( args.subcommand ) {

	case "parse":
		require('./parse/Main')( args );
		break;

	case "build":
		require('./build/Main')( args );
		break;

	case "serve":
		require('./serve/Main')( args );
		break;

	default: 
		console.error("Unrecognized Subcommand");
		return -1;
}

return 0;