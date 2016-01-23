"use strict";

module.exports = function( pathComponents ) {

	return pathComponents.map( uniform );

};

function uniform( component ) {

	// make the first group ([a-z]|[A-Z]) to match consecutive series of caps as well...

	return component.replace( /([a-z])([A-Z])/g, "$1-$2" ).replace( /\s|\.|\$/g, '-').toLowerCase();

}