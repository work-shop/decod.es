module.exports = function prune( quotient ) {


	if ( isArray( quotient ) ) {

		return quotient.map( prune );

	} else if ( isObject( quotient ) ) {
		var updated = {};

		for (var key in quotient) {
			if ( quotient.hasOwnProperty( key ) ) {
				if ( !clearable( quotient[ key ] ) ) {

					updated[ key ] = prune( quotient[ key ] );

				}
			}
		}

		return updated;

	} else {

		//console.log( quotient );

		return quotient;

	}

};

function clearable( object ) {
	return 	typeof object === "undefined" ||
			object === null ||
			(Array.isArray( object ) && object.length === 0 ) ||
			(typeof object === "object" && Object.getOwnPropertyNames( object ).length === 0 );

}

function isObject( quotient ) {
	return quotient !== null && typeof quotient === "object";
}

function isArray( quotient ) {
	return Array.isArray( quotient );
}