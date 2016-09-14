"use strict";

var array = require('./Array');

module.exports = function( ignored ) {
        return function( input ) {
            if ( typeof input === "string" || input instanceof Array ) {

                return input.length;

            } else {

                return (array( ignored )( input )).length;

            }
        };
};
