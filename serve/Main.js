"use strict";

module.exports = function( args ) {

    var express 	= require('express');
    var app 		= express();
    var router 		= require('./Router')( express, app, args );

    router();

};
