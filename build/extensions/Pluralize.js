"use strict";

module.exports = function(  ) {
        return function( items, singular, plural ) {

            if ( typeof plural === "undefined" ) {
                plural = singular;
                singular = "";
            }

            return ( items.length > 1 ) ? plural : singular;

        };
};
