/*********************************************************************************************************************
 *
 * General util stuff
 *
 *********************************************************************************************************************/

const chalk   = require( 'chalk' );
const plumber = require( 'gulp-plumber' );
const ARGS    = require( 'yargs' ).parse( process.argv );

/**
 * Internal helper function for argument parsing: casts an input type to a specific desired type.
 *
 * @param {mixed} value - the input value.
 * @param {mixed} prototype - what we expect the type to be.
 * @return {mixed} a cast value.
 */
function parseArgFromProto( value, prototype )
{
  // switch on type
  if ( Array.isArray( prototype ))
  {
    return ( Array.isArray( value ) ? value : [ value ]).join( ',' ).split( ',' ).map( v => v.trim() );
  }

  return value;
}

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

/**
 * Parses out global arguments.
 *
 * @param {Object} oDefaults - the defaults
 * @return {Object} the parsed arguments
 */
function getGlobalArgs( oDefaults = {} )
{
  const oReturn = oDefaults;

  Object.keys( ARGS ).forEach( sKey =>
  {
    if ( sKey !== '_' && sKey !== '$0' && !sKey.match( /^[a-z]:/ ))
    {
      oReturn[sKey] = parseArgFromProto( ARGS[sKey], oDefaults[sKey] );
    }
  });

  return oReturn;
}

/**
 * Parses out command-line arguments for a specific module.
 *
 * @param {String} sModule - the module to parse for.
 * @param {Object} oDefaults - any defaults
 * @return {Object} any arguments found.
 */
function getModuleArgs( sModule, oDefaults = {} )
{
  const oReturn = oDefaults;
  const sLookup = `${sModule}:`;

  Object.keys( ARGS ).forEach( sKey =>
  {
    if ( sKey.startsWith( sLookup ))
    {
      const sRawKey = sKey.replace( sLookup, '' );
      oReturn[sRawKey] = parseArgFromProto( ARGS[sKey], oDefaults[sRawKey] );
    }
  });

  return oReturn;
}

module.exports = { errorHandler, streamToPromise, getGlobalArgs, getModuleArgs };
