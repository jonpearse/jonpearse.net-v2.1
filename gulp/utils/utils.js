/*********************************************************************************************************************
 *
 * General util stuff
 *
 *********************************************************************************************************************/

const chalk = require( 'chalk' );

/**
 * General error handler.
 */
function errorHandler( err )
{
  console.error( chalk.red( err.message ));
  this.emit( 'end' );
}

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
