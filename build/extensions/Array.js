"use strict";

module.exports = function( ignored ) {
    return function( input ) {

        var array = [];

        for ( var key in input ) {
            if ( input.hasOwnProperty( key ) && ignored.indexOf( key ) === -1 ) {
                array.push( input[ key ] );
            }
        }

        return array;

    };
}
