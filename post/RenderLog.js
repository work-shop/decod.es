"use strict";

var Table = require('cli-table2');
var Color = require('cli-color');

function RenderLog( args, expecting ) {
	if ( !( this instanceof RenderLog )) { return new RenderLog( args, expecting ); }
	var self = this;

	/**
	 * The record structure stores a linear order of stamps
	 * recording the order, status, and message of each of the 
	 * files encountered by walkers using this Log.
	 * 
	 * @type {Array}
	 */
	var recordStructure = new Table({
		head: [ "source","destination", "status", "message", "timestamp"],
		colWidths: [40,40,20,30,10],
		wordWrap: true,
		style: {
			head: []
		}
	});

	self.addLine = function( source, destination, status, message, timestamp ) {

		recordStructure.push([
			source,
			destination,
			colorStatus( status ),
			message,
			timestamp
		]);

	};

	self.print = function() {
		return recordStructure.toString();
	};

}

function colorStatus( status ) {
	switch( status ) {
		case "Skipped":
			return Color.blue( status );
			
		case "OK": 
			return Color.green( status );

		case "Template":
			return Color.yellow( status );

		case "IO":
			return Color.red( status );

		case "Inconsistency":
			return Color.red( status );

		default:
			return "";
	}
}

module.exports = RenderLog;