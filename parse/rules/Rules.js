"use strict";

var Rule = require('./Rule');

var ruleset = [

	new Rule().when({inside: ["decodes", "io"], includes: [".py"] }).preform(),

	new Rule().when({inside: ["decodes", "test"], includes: [".py"]}).preform(),

	new Rule().when({inside: ["decodes"], includes: [".py"] }).preform(),

	new Rule().when({inside: "examples", includes: [".py"]}).preform()

];

function Rules() {

}

module.exports = Rules;