"use strict";

module.exports = function( image ) {
    return image.replace(/&/g, '.').replace(/@/g, '/');
}