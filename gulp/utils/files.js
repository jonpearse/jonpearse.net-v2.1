/*********************************************************************************************************************
 *
 * Revision tasks.
 *
 *********************************************************************************************************************/

// external requires
const { src, dest } = require( 'gulp' );
const rev           = require( 'gulp-rev' );
const del           = require( 'del' );

// internal requires
const { build: OUTPUT, manifest } = require( '../paths' );
const { getProperty } = require( './modules' );
const { errorHandler } = require( './utils' );

/**
 * Creates revisioned versions of files, unless marked as excluded by modules.
 *
 * @return {Stream} a gulp stream
 */
const revision = () =>
{
  // get a list of files to revision
  const aToRevision = Array.prototype.concat.apply([], getProperty( 'noRev' )).map( sP => `!/${OUTPUT}/${sP}` );
  aToRevision.unshift( `${OUTPUT}/**/*` );

  // pass to gulp
  return src( aToRevision )
    .pipe( errorHandler() )
    .pipe( rev() )
    .pipe( require( 'gulp-rev-delete-original' )() )
    .pipe( dest( OUTPUT ))
    .pipe( rev.manifest({
      path: manifest,
      merge: true
    }))
    .pipe( dest( OUTPUT ));
}

/**
 * Cleans built files.
 *
 * @return {Stream} a gulp stream
 */
const clean = () =>
{
  // get a list of files to clean
  const aToClean = Array.prototype.concat.apply(
    [ `${OUTPUT}/**/*`, `${OUTPUT}/**/.*`, `!${OUTPUT}/.keep` ],
    getProperty( 'toClean' )
  );

  // pass it off
  return del( aToClean );
}

module.exports = { revision, clean };
