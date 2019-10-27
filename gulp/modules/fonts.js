/*********************************************************************************************************************
 *
 * Font tasks.
 *
 *********************************************************************************************************************/

const { src, dest } = require( 'gulp' );
const rename        = require( 'gulp-rename' );

// core stuff
const { fonts: PATHS, build: OUTPUT } = require( '../paths' );
const { errorHandler } = require( '../utils/utils' );

/**
 * Actual build task.
 *
 * @return {Stream} a gulp stream
 */
const fonts = () =>
  src( PATHS.source )
    .pipe( errorHandler() )
    .pipe( rename( oPath =>
    {
      const sDir  = oPath.dirname.toLowerCase();
      const sFont = oPath.basename.toLowerCase();

      // if dir + font are different, prefix things
      if (sDir !== sFont)
      {
        oPath.basename = `${oPath.dirname}-${oPath.basename}`;
      }

      // always unset the dirname
      oPath.dirname = '';
    }))
    .pipe( dest( OUTPUT ));


/** Expose things */
module.exports = {
  init: [ fonts ],
  watch: {
    files: PATHS.watch,
    tasks: [ fonts ]
  },
  build: [ fonts ]
}
