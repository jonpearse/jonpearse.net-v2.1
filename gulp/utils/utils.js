/*********************************************************************************************************************
 *
 * General util stuff
 *
 *********************************************************************************************************************/

const chalk   = require( 'chalk' );
const plumber = require( 'gulp-plumber' );

/**
 * General error handler.
 *
 * @return {Stream} a gulp stream
 */
const errorHandler = () => plumber({ errorHandler: function( err )
{
  console.error( chalk.yellow.bold( err.plugin ) + ': ' + chalk.red( err.message ));
  this.emit( 'end' );
}});

/**
 * Wraps a gulp stream in a Promise.
 *
 * @param {Stream} stream - the inbound stream
 * @return {Promise} a Promise that is resolved when the stream closes.
 */
function streamToPromise( stream )
{
  return new Promise( fnResolve => stream.on( 'end', fnResolve ));
}

module.exports = { errorHandler, streamToPromise };
