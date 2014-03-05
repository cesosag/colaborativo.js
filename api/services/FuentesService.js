/**
 * FuentesService.js
 *
 * @description :: Servicio de revision de fuentes, activa y desactiva fuentes segun sea necesario.
 * @docs		:: TODO
 */

var colors = require('colors'),
	later  = require('later');

module.exports.start = function(){
	console.log("info: ".green + "Fuentes check background service starting...");

	RevisarFuentes();

	var sched       = later.parse.text('every 30 seconds'),
		timer 		= later.setInterval( RevisarFuentes, sched );

	function RevisarFuentes(){ 
		console.log("info: ".green + "Checking Fuentes on all active Tableros");

		// Traemos los tableros activos y revisamos las fuentes de cada uno
		Tablero.find().where({ active: true }).exec( function( err, tableros){
			if( err ){
				console.log( err );
			}else{
				for (var i = 0; i < tableros.length; i++) {
					console.log(" ");
					console.log( "========".grey );
					console.log(" ");
					console.log("Tablero: ".cyan + tableros[i].name );
					console.log(" ");
					Fuente.find({ entablero: tableros[i].id }).exec( function( err, fuentes ){
						if( err ){
							console.log( err );
						}else{
							for (var i = 0; i < fuentes.length; i++) {

								ActivarDesactivarFuente( fuentes[i] );
		
							}
						}
					});
					console.log( "========".grey );
					console.log(" ");
				}
			}
		});
	}

	function ActivarDesactivarFuente( fuente ){
		if( fuente.active === false ){
			console.log( colors.red( " Fuente " + fuente.id + " inactive" ) );
			InfoFuente( fuente ); 

			DesactivarFuente( fuente.id, fuente.network, fuente.query );
		}else{
			console.log( colors.green( " Fuente " + fuente.id + " active" ) );
			InfoFuente( fuente ); 

			ActivarFuente( fuente.id, fuente.network, fuente.query, fuente.entablero );
		}

		function InfoFuente( fuente ){
			console.log("  Network: ".magenta + fuente.network );
			console.log("  Query: ".magenta + fuente.query );
			console.log(" ");
		}
	}

	function ActivarFuente( id, network, query, tablero ){
		if( network === "twitter" ){
			var activar = TwitterStream.listenToStream( id, 'statuses/filter', 'tweet' , { track: query }, tablero );
		}
	}

	function DesactivarFuente( id, network, query ){
		if( network === "twitter" ){
			var desactivar = TwitterStream.closeStream( id );
		}
	}
}