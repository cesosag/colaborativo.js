/**
 * JobsKue.js
 *
 * @description :: Servicio para producir un kue de trabajos escalable.
 * @docs		:: TODO
 */

 var kue  = require('kue'), 
 	 url = require('url'), 
 	 redis = require('redis');

 if (process.env.REDISTOGO_URL) {
 	console.log( "Redis URL: " + process.env.REDISTOGO_URL)
    kue.redis.createClient = function() {
	    var redisUrl = url.parse(process.env.REDISTOGO_URL)
	      , client = redis.createClient(redisUrl.port, redisUrl.hostname);
	    if (redisUrl.auth) {
	        client.auth(redisUrl.auth.split(":")[1]);
	    }
	    return client;
	};
}

 var jobs = kue.createQueue();

   kue.app.set('title', 'Colaborativo Jobs');
   kue.app.listen(3000);

module.exports.create = function( type, params, priority, delay ){
 	var priority = priority || 0,
 		delay = delay || 0;
 	console.log("info: ".green + "Creando job tipo: " + type + ", Prioridad: " + priority + ", con Params: ", params );
 	var job = jobs.create( type, params ).priority( priority ).delay( delay ).save();
 	return job;
}

module.exports.process = function( type, callback ){
 	console.log("info: ".green + "Procesando jobs tipo: " + type);
 	jobs.process( type, callback );
 	jobs.promote( 1000 );
}

module.exports.shutdown = function () {
	jobs.shutdown( function(err) {
		console.log( 'Kue is shut down.', err||'' );
		process.exit( 0 );
	}, 5000 );
}