"use strict";

module.exports = function( pathComponents ) {

	return pathComponents.map( uniform );

};

function uniform( component ) {

	return component.replace( /\s|\.|\$/g, '-').toLowerCase();

};